# -------------------------------
# 🔗 Standard & Third-Party Imports
# -------------------------------
import os
import shutil
from datetime import datetime
from fastapi import (
    FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

# -------------------------------
# 📦 Internal Imports
# -------------------------------
import models, database, schemas, pdf_parser
from models import (
    Result, AdminUser, AutonomousResult, InternalMark, Notification
)
from schemas import ExamTypeEnum, NotificationOut, CGPAResponse
from database import get_db
from utils import GRADE_POINTS
from internal_parser import parse_internal_pdf

# -------------------------------
# 🚀 FastAPI App Initialization
# -------------------------------
app = FastAPI()

# ✅ CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔒 Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create Tables
models.Base.metadata.create_all(bind=database.engine)

# -------------------------------
# 📄 Upload Regular/Supply Result PDF
# -------------------------------
@app.post("/upload_pdf/")
async def upload_pdf(
    year: int = Form(...), 
    semester: int = Form(...),
    exam_type: ExamTypeEnum = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        stats = pdf_parser.parse_pdf_and_store(temp_path, year, semester, exam_type.value, db)
        return {
            "message": "✅ Regular/Supply Results Uploaded",
            "total_results": stats["total_results"],
            "unique_students": stats["unique_students"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(temp_path)

# -------------------------------
# 📄 Upload Autonomous PDF (To Be Implemented)
# -------------------------------

# -------------------------------
# 📄 Upload Internals PDF
# -------------------------------
@app.post("/upload_internals/")
def upload_internals_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        entries = parse_internal_pdf(temp_path)
        for entry in entries:
            mark = InternalMark(
                htno=entry["htno"],
                subject_code=entry["subject_code"],
                subject_name=entry["subject_name"],
                marks=entry["marks"]
            )
            db.add(mark)
        db.commit()
        return {"message": "Internals uploaded", "total": len(entries)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(temp_path)

# -------------------------------
# 🔍 Fetch Results by HTNO
# -------------------------------
@app.get("/get_result/{htno}", response_model=list[schemas.ResultOut])
def get_result(htno: str, db: Session = Depends(get_db)):
    results = db.query(Result).filter(Result.htno == htno).all()
    if not results:
        raise HTTPException(status_code=404, detail="Result not found")
    return results

# -------------------------------
# 🧠 CGPA Calculation (Bulk)
# -------------------------------
@app.get("/calculate_cgpa", response_model=CGPAResponse)
def calculate_cgpa(
    start_htno: str = Query(...),
    end_htno: str = Query(...),
    db: Session = Depends(get_db)
):
    results = db.query(Result).filter(Result.htno.between(start_htno, end_htno)).all()
    student_data = {}

    for res in results:
        if res.htno not in student_data:
            student_data[res.htno] = {}

        subcode = res.subcode

        if subcode not in student_data[res.htno]:
            student_data[res.htno][subcode] = res
        else:
            prev = student_data[res.htno][subcode]
            if prev.grade in ("F", "Ab") and res.grade not in ("F", "Ab"):
                student_data[res.htno][subcode] = res

    report = []

    for htno, subjects in student_data.items():
        total_credits = 0.0
        total_grade_points = 0.0
        backlogs = 0

        for result in subjects.values():
            grade = result.grade.upper()
            if grade in ("F", "AB"):
                backlogs += 1
                continue

            credits = result.credits
            grade_point = GRADE_POINTS.get(grade, 0)
            total_credits += credits
            total_grade_points += credits * grade_point

        cgpa = round(total_grade_points / total_credits, 2) if total_credits else 0.0

        report.append({
            "htno": htno,
            "cgpa": cgpa,
            "backlogs": backlogs
        })

    return {"report": report}

# -------------------------------
# 🔍 Filter by CGPA/Backlogs
# -------------------------------
@app.get("/filter_cgpa_backlogs", response_model=CGPAResponse)
def filter_cgpa_backlogs(
    min_cgpa: float = Query(0.0),
    max_cgpa: float = Query(10.0),
    min_backlogs: int = Query(0),
    max_backlogs: int = Query(100),
    start_htno: str = Query(...),
    end_htno: str = Query(...),
    db: Session = Depends(get_db)
):
    results = db.query(Result).filter(Result.htno.between(start_htno, end_htno)).all()
    student_data = {}

    for res in results:
        if res.htno not in student_data:
            student_data[res.htno] = {}

        subcode = res.subcode
        grade = res.grade.upper()

        if subcode not in student_data[res.htno]:
            student_data[res.htno][subcode] = res
        else:
            prev = student_data[res.htno][subcode]
            if prev.grade.upper() in ("F", "AB") and grade not in ("F", "AB"):
                student_data[res.htno][subcode] = res

    report = []

    for htno, subjects in student_data.items():
        total_credits = 0.0
        total_points = 0.0
        backlogs = 0

        for res in subjects.values():
            grade = res.grade.upper()
            if grade in ("F", "AB"):
                backlogs += 1
                continue

            gp = GRADE_POINTS.get(grade, 0)
            total_credits += res.credits
            total_points += res.credits * gp

        cgpa = round(total_points / total_credits, 2) if total_credits else 0.0

        if (min_cgpa <= cgpa < max_cgpa) and (min_backlogs <= backlogs < max_backlogs):
            report.append({
                "htno": htno,
                "cgpa": cgpa,
                "backlogs": backlogs
            })

    return {"report": report}

# -------------------------------
# 🔐 Admin Signup & Login
# -------------------------------
@app.post("/admin/signup")
def signup(data: schemas.AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(AdminUser).filter(AdminUser.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = AdminUser(username=data.username, password=data.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Signup successful", "user": {"id": user.id, "username": user.username}}

@app.post("/admin/login")
def login(data: schemas.AdminCreate, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(
        AdminUser.username == data.username,
        AdminUser.password == data.password
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": {"id": user.id, "username": user.username}}

# -------------------------------
# 🐞 Debug HTNOs
# -------------------------------
@app.get("/debug_autonomous_htnos")
def debug_autonomous_htnos(db: Session = Depends(get_db)):
    results = db.query(AutonomousResult).all()
    return list({r.htno for r in results})

# -------------------------------
# 📢 Notifications (CRUD)
# -------------------------------
UPLOAD_DIR = "uploads/notifications"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/notifications/", response_model=NotificationOut)
async def create_notification(
    heading: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    file_path = None
    if file:
        filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_path = f"/uploads/notifications/{filename}"

    notif = Notification(
        heading=heading,
        description=description,
        file_path=file_path,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

@app.get("/notifications/", response_model=list[NotificationOut])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()

@app.delete("/notifications/{notification_id}", response_model=dict)
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter_by(id=notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Remove attached file
    if notification.file_path:
        file_disk_path = notification.file_path.lstrip("/")
        if os.path.exists(file_disk_path):
            os.remove(file_disk_path)

    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted successfully"}
