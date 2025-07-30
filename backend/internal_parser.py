import fitz  # type: ignore

import re

def parse_internal_pdf(file_path: str):
    doc = fitz.open(file_path)
    data = []
    current_htno = None

    total_pages = len(doc)
    total_words = 0
    found_htnos = set()
    record_attempts = 0
    valid_records = 0

    print(f"🔍 Parsing: {file_path}")
    print(f"📄 Total Pages: {total_pages}")

    for page_num, page in enumerate(doc, start=1):
        words = page.get_text("words")  # List of [x0, y0, x1, y1, word]
        words.sort(key=lambda w: (w[1], w[0]))  # Sort by vertical first, then horizontal

        total_words += len(words)
        print(f"📄 Page {page_num}: {len(words)} words")

        i = 0
        while i < len(words):
            word = words[i][4]

            # ✅ Detect HTNO (10-digit roll number)
            if re.fullmatch(r"\d{10}", word):
                current_htno = word
                found_htnos.add(current_htno)
                print(f"🎯 Found HTNO: {current_htno}")
                i += 1
                continue

            # ✅ Try to detect a valid subject + mark record
            if (
                current_htno and
                i + 2 < len(words) and
                re.fullmatch(r"[A-Z0-9]{4,}", words[i][4]) and  # subject code
                re.fullmatch(r"[A-Za-z&\-,]+", words[i + 1][4]) and  # subject name (part)
                re.fullmatch(r"\d{1,3}", words[i + 2][4])  # marks
            ):
                subject_code = words[i][4]
                subject_name = words[i + 1][4]
                marks = int(words[i + 2][4])
                record_attempts += 1

                data.append({
                    "htno": current_htno,
                    "subject_code": subject_code,
                    "subject_name": subject_name,
                    "marks": marks
                })

                print(f"✅ Added: {current_htno} | {subject_code} | {subject_name} | {marks}")
                valid_records += 1
                i += 3
                continue

            i += 1  # move to next word if no match

    print(f"\n📊 Summary:")
    print(f"   🧾 Total Words Processed: {total_words}")
    print(f"   👤 Unique HTNOs Found: {len(found_htnos)}")
    print(f"   📥 Record Attempts: {record_attempts}")
    print(f"   ✅ Valid Records Extracted: {valid_records}")
    print(f"   ❌ Skipped Lines: {record_attempts - valid_records}")

    return data