import pdfplumber
from models import Result
from sqlalchemy.orm import Session

def parse_pdf_and_store(pdf_path: str, year: int, semester: int, exam_type: str, db: Session):
    total_results = 0
    unique_htnos = set()

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue

            for row in table[1:]:  # Skip header
                if len(row) == 7:
                    _, htno, subcode, subname, internals, grade, credits = row
                elif len(row) == 6:
                    htno, subcode, subname, internals, grade, credits = row
                else:
                    continue

                if not htno or not subcode:
                    continue

                try:
                    htno = htno.strip()
                    subcode = subcode.strip()
                    subname = subname.strip()
                    grade = grade.strip().upper()
                    credits = float(credits)
                    internals = 0 if internals.strip().upper() == "ABSENT" else int(internals)

                    original_exam_type = exam_type  # Store original for supply logic

                    # ✅ Supply upload logic
                    if exam_type.lower() == "supply":
                        if grade != "F":
                            # Try updating failed regular
                            failed_regular = db.query(Result).filter(
                                Result.htno == htno,
                                Result.subcode == subcode,
                                Result.semester == semester,
                                Result.year == year,
                                Result.exam_type == "Regular",
                                Result.grade == "F"
                            ).first()

                            if failed_regular:
                                print(f"🔁 Updating failed regular: {htno} - {subcode}")
                                failed_regular.grade = grade
                                failed_regular.internals = internals
                                failed_regular.credits = credits
                                db.add(failed_regular)
                                total_results += 1
                                unique_htnos.add(htno)
                                continue

                        # No failed regular or still failed in supply — store as supply
                        exam_type = "Supply"

                    # ✅ Now check if record already exists (with updated exam_type)
                    existing = db.query(Result).filter(
                        Result.htno == htno,
                        Result.subcode == subcode,
                        Result.semester == semester,
                        Result.year == year,
                        Result.exam_type == exam_type
                    ).first()

                    if existing:
                        print(f"⚠️ Duplicate entry exists: {htno}-{subcode}-{semester}-{year}-{exam_type}")
                        continue

                    # ✅ Insert result
                    db_result = Result(
                        htno=htno,
                        subcode=subcode,
                        subname=subname,
                        internals=internals,
                        grade=grade,
                        credits=credits,
                        semester=semester,
                        year=year,
                        exam_type=exam_type
                    )

                    db.add(db_result)
                    total_results += 1
                    unique_htnos.add(htno)

                except Exception as e:
                    print(f"⚠️ Error while processing row: {e} | Row: {row}")
                    continue

    db.commit()
    return {
        "total_results": total_results,
        "unique_students": len(unique_htnos)
    }
