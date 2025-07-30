from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

# -----------------------------
# 🎓 Enum for Exam Types
# -----------------------------
class ExamTypeEnum(str, Enum):
    regular = "Regular"
    supply = "Supply"
    autonomous = "Autonomous"

# -----------------------------
# 📊 Result Output Schema
# -----------------------------
class ResultOut(BaseModel):
    htno: str
    subcode: str
    subname: str
    internals: int
    grade: str
    credits: float
    year: int
    semester: int
    exam_type: str

    class Config:
        orm_mode = True

# -----------------------------
# 🛡️ Admin Schemas
# -----------------------------
class AdminCreate(BaseModel):
    username: str
    password: str

class AdminOut(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

# -----------------------------
# 🏫 Autonomous Result (if needed)
# -----------------------------
class AutonomousResultOut(BaseModel):
    htno: str
    branch: str
    subjects: str
    sgpa: str

    class Config:
        orm_mode = True

# -----------------------------
# 📢 Notification Schemas
# -----------------------------
class NotificationCreate(BaseModel):
    heading: str
    description: str

class NotificationOut(BaseModel):
    id: int
    heading: str
    description: str
    file_path: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

# -----------------------------
# 📈 CGPA Calculation Schema
# -----------------------------
class StudentCGPA(BaseModel):
    htno: str
    cgpa: float
    backlogs: int

class CGPAResponse(BaseModel):
    report: List[StudentCGPA]

# -----------------------------
# 📝 Internal Marks Schema
# -----------------------------
class InternalMarkOut(BaseModel):
    htno: str
    subject_code: str
    subject_name: str
    marks: int

    class Config:
        orm_mode = True
