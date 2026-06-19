from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app.services.career_advisor import get_career_advice

from app.database import engine
from app.dependencies import get_db
from app.models.worker import Worker
from app.models.job import Job
from app.models.db_models import WorkerDB, JobDB, Base

app = FastAPI(title="B-WIN MVP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ----------------------------------
# Basic APIs
# ----------------------------------

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

# ----------------------------------
# Worker APIs
# ----------------------------------

@app.post("/workers")
def create_worker(worker: Worker, db: Session = Depends(get_db)):

    new_worker = WorkerDB(
        name=worker.name,
        age=worker.age,
        location=worker.location,
        skill=worker.skill
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return {
        "message": "Worker registered successfully",
        "id": new_worker.id
    }


@app.get("/workers")
def get_workers(db: Session = Depends(get_db)):
    return db.query(WorkerDB).all()


# ----------------------------------
# Job APIs
# ----------------------------------

@app.post("/jobs")
def create_job(job: Job, db: Session = Depends(get_db)):

    new_job = JobDB(
        title=job.title,
        company=job.company,
        location=job.location,
        required_skill=job.required_skill,
        salary=job.salary
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {
        "message": "Job created successfully",
        "id": new_job.id
    }


@app.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    return db.query(JobDB).all()


# ----------------------------------
# Job Matching API
# ----------------------------------

@app.get("/match-jobs/{worker_id}")
def match_jobs(worker_id: int, db: Session = Depends(get_db)):

    worker = db.query(WorkerDB).filter(
        WorkerDB.id == worker_id
    ).first()

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    matched_jobs = db.query(JobDB).filter(
        JobDB.required_skill == worker.skill
    ).all()

    return {
        "worker": {
            "id": worker.id,
            "name": worker.name,
            "skill": worker.skill
        },
        "matched_jobs": [
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "salary": job.salary
            }
            for job in matched_jobs
        ],
        "total_matches": len(matched_jobs)
    }
@app.get("/career-advice/{worker_id}")
def career_advice(worker_id: int, db: Session = Depends(get_db)):

    worker = db.query(WorkerDB).filter(
        WorkerDB.id == worker_id
    ).first()

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    advice = get_career_advice(worker.skill)

    return {
        "worker": worker.name,
        "skill": worker.skill,
        "advice": advice
    }