import pdfplumber
import re
from sqlalchemy.orm import Session
from models import AutonomousResult

# ✅ HTNO pattern: e.g., 24B81A0108
def is_valid_htno(value: str) -> bool:
    return bool(re.match(r"\d{2}[A-Z]{4}\d{4}", value.strip().upper()))

def parse_autonomous_pdf(pdf_path: str, year: int, semester: int, db: Session):
    with pdfplumber.open(pdf_path) as pdf:
        subject_codes = []
        students_parsed = 0
        students_skipped = 0
        records_inserted = 0

        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue

            for row in table:
                if not row or len(row) < 3:
                    continue

                # Detect subject header row
                if "HTNO" in row[1].upper():
                    subject_codes = [cell.strip() for cell in row[2:-1] if cell]
                    print(f"📘 Detected subjects: {subject_codes}")
                    continue

                # 🔍 Find HTNO in entire row
                htno = next((cell.strip() for cell in row if cell and is_valid_htno(cell)), None)
                if not htno:
                    students_skipped += 1
                    continue

                print(f"✅ Parsing HTNO: {htno}")

                try:
                    grades = row[2:-1]
                    sgpa = float(row[-1]) if row[-1] and row[-1].replace('.', '', 1).isdigit() else 0.0

                    for i, grade in enumerate(grades):
                        if i >= len(subject_codes):
                            continue
                        subject_code = subject_codes[i]
                        grade = grade.strip().upper() if grade else "NA"

                        # Avoid duplicate
                        exists = db.query(AutonomousResult).filter_by(
                            htno=htno,
                            subject_code=subject_code,
                            year=year,
                            semester=semester
                        ).first()
                        if exists:
                            continue

                        result = AutonomousResult(
                            htno=htno,
                            subject_code=subject_code,
                            grade=grade,
                            sgpa=sgpa,
                            year=year,
                            semester=semester
                        )
                        db.add(result)
                        records_inserted += 1

                    students_parsed += 1
                except Exception as e:
                    print(f"⚠️ Error parsing {htno}: {e}")
                    students_skipped += 1
                    continue

        db.commit()
        return {
            "message": "✅ Autonomous PDF parsed successfully",
            "students_parsed": students_parsed,
            "students_skipped": students_skipped,
            "records_inserted": records_inserted
        }
