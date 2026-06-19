from sqlalchemy import Column, Integer, String
from app.database import Base


class WorkerDB(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    location = Column(String)
    skill = Column(String)


class JobDB(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    required_skill = Column(String)
    salary = Column(Integer)