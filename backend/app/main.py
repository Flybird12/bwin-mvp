from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine
from app.dependencies import get_db
from app.models.worker import Worker
from app.models.job import Job
from app.models.db_models import (
    WorkerDB,
    JobDB,
    Base,
)

from app.services.career_advisor import get_career_advice
from app.services.job_matcher import match_jobs
from app.services.resume_parser import (
    extract_text,
    extract_skills,
)

app = FastAPI(title="B-WIN MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ==========================================================
# BASIC APIS
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "B-WIN MVP API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ==========================================================
# WORKER APIS
# ==========================================================

@app.post("/workers")
def create_worker(
    worker: Worker,
    db: Session = Depends(get_db)
):

    new_worker = WorkerDB(
        name=worker.name,
        age=worker.age,
        location=worker.location,
        skill=worker.skill,
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return {
        "message": "Worker registered successfully",
        "id": new_worker.id,
    }


@app.get("/workers")
def get_workers(
    db: Session = Depends(get_db)
):
    return db.query(WorkerDB).all()


# ==========================================================
# JOB APIS
# ==========================================================

@app.post("/jobs")
def create_job(
    job: Job,
    db: Session = Depends(get_db)
):

    new_job = JobDB(
        title=job.title,
        company=job.company,
        location=job.location,
        required_skill=job.required_skill,
        salary=job.salary,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {
        "message": "Job created successfully",
        "id": new_job.id,
    }


@app.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db)
):
    return db.query(JobDB).all()


# ==========================================================
# AI JOB MATCHING
# ==========================================================

@app.get("/match-jobs/{worker_id}")
def get_matched_jobs(
    worker_id: int,
    db: Session = Depends(get_db)
):

    worker = (
        db.query(WorkerDB)
        .filter(WorkerDB.id == worker_id)
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found",
        )

    jobs = db.query(JobDB).all()

    matched_jobs = match_jobs(
        worker.skill,
        jobs,
    )

    return {
        "worker": {
            "id": worker.id,
            "name": worker.name,
            "skills": worker.skill,
        },
        "matched_jobs": matched_jobs,
        "total_matches": len(matched_jobs),
    }


# ==========================================================
# CAREER ADVICE
# ==========================================================

@app.get("/career-advice/{worker_id}")
def career_advice(
    worker_id: int,
    db: Session = Depends(get_db)
):

    worker = (
        db.query(WorkerDB)
        .filter(WorkerDB.id == worker_id)
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found",
        )

    advice = get_career_advice(
        worker.skill
    )

    return {
        "worker": worker.name,
        "skill": worker.skill,
        "advice": advice,
    }
# ==========================================================
# RESUME UPLOAD API
# ==========================================================

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):
    """
    Upload a PDF resume, extract text and detect skills.
    """

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(
        upload_dir,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    resume_text = extract_text(file_path)

    detected_skills = extract_skills(
        resume_text
    )

    return {
        "success": True,
        "filename": file.filename,
        "skills": detected_skills,
        "total_skills": len(detected_skills),
        "resume_preview": resume_text[:500]
    }