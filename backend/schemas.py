from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import datetime
class ExamTypeEnum(str, Enum):
    regular = "Regular"
    supply = "Supply"
    autonomous = "Autonomous"

class ResultOut(BaseModel):
    htno: str
    subcode: str
    subname: str
    internals: int
    grade: str
    credits: float
    year: int
    semester: int
    exam_type: str  # ✅ Added to send to frontend

    class Config:
        orm_mode = True

from pydantic import BaseModel

class AdminCreate(BaseModel):
    username: str
    password: str

class AdminOut(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True
from pydantic import BaseModel

class AutonomousResultOut(BaseModel):
    htno: str
    subject_code: str
    grade: str
    sgpa: float
    year: int
    semester: int

    class Config:
        orm_mode = True
class NotificationCreate(BaseModel):
    heading: str
    description: str

class NotificationOut(BaseModel):
    id: int
    heading: str
    description: str
    file_path: str | None
    created_at: datetime

    class Config:
        orm_mode = True
