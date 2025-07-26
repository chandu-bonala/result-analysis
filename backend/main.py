from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import shutil, os

import models, database, schemas, pdf_parser
from schemas import ExamTypeEnum, NotificationOut
from models import AdminUser, AutonomousResult, Notification
from autonomous_parser import parse_autonomous_pdf
from database import get_db

# 🚀 FastAPI App Initialization
app = FastAPI()

# ✅ CORS (for React Native frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create DB Tables
models.Base.metadata.create_all(bind=database.engine)

# ---------------------------------------------------------
# 🟢 Upload Regular/Supply PDF
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# 🟢 Upload Autonomous PDF
# ---------------------------------------------------------
@app.post("/upload_autonomous_pdf")
def upload_autonomous_pdf(
    year: int = Form(...),
    semester: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    upload_dir = "uploaded_pdfs"
    os.makedirs(upload_dir, exist_ok=True)
    pdf_path = os.path.join(upload_dir, file.filename)

    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = parse_autonomous_pdf(pdf_path, year, semester, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Autonomous Upload Failed: {e}")

# ---------------------------------------------------------
# 🔍 Fetch Regular/Supply Result by HTNO
# ---------------------------------------------------------
@app.get("/get_result/{htno}", response_model=list[schemas.ResultOut])
def get_result(htno: str, db: Session = Depends(get_db)):
    results = db.query(models.Result).filter(models.Result.htno == htno).all()
    if not results:
        raise HTTPException(status_code=404, detail="Result not found")
    return results

# ---------------------------------------------------------
# 🔍 Fetch Autonomous Result by HTNO
# ---------------------------------------------------------
@app.get("/autonomous_result/{htno}")
def get_autonomous_result(htno: str, db: Session = Depends(get_db)):
    results = db.query(AutonomousResult).filter_by(htno=htno).all()
    if not results:
        raise HTTPException(status_code=404, detail="No autonomous result found")
    return results

# ---------------------------------------------------------
# 🔐 Admin Signup
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# 🔐 Admin Login
# ---------------------------------------------------------
@app.post("/admin/login")
def login(data: schemas.AdminCreate, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(
        AdminUser.username == data.username,
        AdminUser.password == data.password
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": {"id": user.id, "username": user.username}}

# ---------------------------------------------------------
# 🐞 Debug All HTNOs in Autonomous Table
# ---------------------------------------------------------
@app.get("/debug_autonomous_htnos")
def debug_autonomous_htnos(db: Session = Depends(get_db)):
    results = db.query(AutonomousResult).all()
    return list({r.htno for r in results})

# ---------------------------------------------------------
# 📢 Notifications API
# ---------------------------------------------------------
UPLOAD_DIR = "uploads/notifications"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/notifications/", response_model=schemas.NotificationOut)
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

    notif = models.Notification(
        heading=heading,
        description=description,
        file_path=file_path,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


@app.get("/notifications/", response_model=list[schemas.NotificationOut])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).order_by(models.Notification.created_at.desc()).all()
UPLOAD_DIR = "uploads/notifications"
os.makedirs(UPLOAD_DIR, exist_ok=True)
