from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base
from datetime import datetime

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    htno = Column(String, index=True)
    subcode = Column(String)
    subname = Column(String)
    internals = Column(Integer)
    grade = Column(String)
    credits = Column(Float)
    year = Column(Integer) 
    semester = Column(Integer)
    exam_type = Column(String)
from sqlalchemy import Column, Integer, String
from database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
from sqlalchemy import Column, Integer, String, Float
from database import Base

class AutonomousResult(Base):
    __tablename__ = "autonomous_results"

    id = Column(Integer, primary_key=True, index=True)
    htno = Column(String, index=True)
    subject_code = Column(String)
    grade = Column(String)
    sgpa = Column(Float)
    year = Column(Integer)           # ✅ Added
    semester = Column(Integer)       # ✅ Added
class Notification(Base):
    __tablename__ = "college_notifications"  # ✅ new table name

    id = Column(Integer, primary_key=True, index=True)
    heading = Column(String, nullable=False)
    description = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())