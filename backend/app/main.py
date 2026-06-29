"""
B-WIN (Blue-collar Worker Intelligent Network) — FastAPI backend.

Single-file, production-ready API exposing worker management, job
management, AI-powered job matching, resume parsing and career advice.

Backward-compatibility note:
    The following endpoints (and their exact request/response shapes) are
    treated as a frozen public contract because the existing frontend
    depends on them: POST/GET /workers, POST/GET /jobs, POST /upload-resume,
    GET /match-jobs/{worker_id}, GET /career-advice/{worker_id}.
    Only `/` and `/health` (which are not part of that contract) have an
    expanded response shape.
"""

# --- Standard library -------------------------------------------------------
import warnings
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

# --- Third-party --------------------------------------------------------------
from fastapi import (
    Body,
    Depends,
    FastAPI,
    File,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

try:
    # python-dotenv is optional — if it isn't installed, real environment
    # variables (e.g. those set by Render) still work without it.
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# --- Local application --------------------------------------------------------
from app.database import engine
from app.dependencies import get_db
from app.models.db_models import Base, JobDB, WorkerDB
from app.models.job import Job
from app.models.worker import Worker
from app.services.career_advisor import get_career_advice
from app.services.job_matcher import match_jobs
from app.services.resume_parser import extract_skills, extract_text

# ==============================================================================
# CONFIGURATION (environment variables, with sensible defaults)
# ==============================================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# NOTE: the real SQLAlchemy engine is created in app/database.py. This value
# is only surfaced here for the health-check endpoint and documentation.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bwin.db")

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".docx", ".txt"}

_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

# ==============================================================================
# LOGGING
# ==============================================================================

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("bwin")
warnings.filterwarnings("ignore", category=DeprecationWarning)

if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY is not set — AI-powered features may be degraded.")

if ALLOWED_ORIGINS == ["*"]:
    logger.warning("ALLOWED_ORIGINS is '*'. Set it in .env before deploying to production.")

# ==============================================================================
# APPLICATION SETUP
# ==============================================================================

TAGS_METADATA = [
    {"name": "System", "description": "Service health and status endpoints."},
    {"name": "Workers", "description": "Worker registration and retrieval."},
    {"name": "Jobs", "description": "Job posting management."},
    {"name": "Matching", "description": "AI-powered job matching for workers."},
    {"name": "Career Advice", "description": "AI-generated career guidance."},
    {"name": "Resume", "description": "Resume upload, parsing and analysis."},
]

app = FastAPI(
    title="B-WIN MVP API",
    description=(
        "Blue-collar Worker Intelligent Network (B-WIN) backend. "
        "Provides worker and job management, AI-powered job matching, "
        "resume parsing and personalized career advice."
    ),
    version=APP_VERSION,
    openapi_tags=TAGS_METADATA,
)

# Browsers reject `allow_credentials=True` combined with a wildcard origin,
# so credentials are only enabled once specific origins are configured.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOWED_ORIGINS != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except SQLAlchemyError as exc:
    logger.error("Failed to initialize database tables: %s", exc)
    raise

try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    logger.info("Upload folder ready at '%s'.", UPLOAD_FOLDER)
except OSError as exc:
    logger.error("Failed to create upload folder '%s': %s", UPLOAD_FOLDER, exc)
    raise


@app.on_event("startup")
def log_startup() -> None:
    """Log a short banner once the application has finished initializing."""
    logger.info("B-WIN MVP API ready (version=%s, log_level=%s).", APP_VERSION, LOG_LEVEL)


# ==============================================================================
# HELPERS
# ==============================================================================

def validate_worker_payload(worker: Worker) -> None:
    """Validate a worker registration payload.

    Parameters:
        worker (Worker): Worker data submitted by the client.

    Raises:
        HTTPException: 400 if name, age or skill are missing/out of range.
    """
    if not worker.name or not worker.name.strip():
        raise HTTPException(status_code=400, detail="Worker name must not be empty.")

    if worker.age is None or not (18 <= worker.age <= 65):
        raise HTTPException(status_code=400, detail="Worker age must be between 18 and 65.")

    if not worker.skill or not worker.skill.strip():
        raise HTTPException(status_code=400, detail="Worker skill must not be empty.")


def validate_job_payload(job: Job) -> None:
    """Validate a job creation payload.

    Parameters:
        job (Job): Job data submitted by the client.

    Raises:
        HTTPException: 400 if title/required_skill are empty or salary isn't positive.
    """
    if not job.title or not job.title.strip():
        raise HTTPException(status_code=400, detail="Job title must not be empty.")

    if not job.required_skill or not job.required_skill.strip():
        raise HTTPException(status_code=400, detail="Job required_skill must not be empty.")

    if job.salary is None or job.salary <= 0:
        raise HTTPException(status_code=400, detail="Job salary must be a positive number.")


def worker_to_dict(worker: WorkerDB) -> dict:
    """Convert a WorkerDB row into a plain, JSON-serializable dict.

    Parameters:
        worker (WorkerDB): ORM row to convert.

    Returns:
        dict: id, name, age, location and skill.
    """
    return {
        "id": worker.id,
        "name": worker.name,
        "age": worker.age,
        "location": worker.location,
        "skill": worker.skill,
    }


def job_to_dict(job: JobDB) -> dict:
    """Convert a JobDB row into a plain, JSON-serializable dict.

    Parameters:
        job (JobDB): ORM row to convert.

    Returns:
        dict: id, title, company, location, required_skill and salary.
    """
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "required_skill": job.required_skill,
        "salary": job.salary,
    }


def sanitize_filename(filename: str) -> str:
    """Strip directory components and unsafe characters from a filename.

    Parameters:
        filename (str): Original, client-supplied filename.

    Returns:
        str: A filesystem-safe filename with no path separators.
    """
    base_name = Path(filename).name.replace("..", "")
    safe_name = re.sub(r"[^A-Za-z0-9_.-]", "_", base_name)
    return safe_name or "uploaded_file"


def build_upload_path(filename: str) -> Path:
    """Build a unique, traversal-safe destination path for an uploaded file.

    Parameters:
        filename (str): Original, client-supplied filename.

    Returns:
        Path: An absolute path guaranteed to live inside UPLOAD_FOLDER.

    Raises:
        HTTPException: 400 if the resulting path would escape UPLOAD_FOLDER.
    """
    upload_dir = Path(UPLOAD_FOLDER).resolve()
    unique_name = f"{uuid.uuid4().hex}_{sanitize_filename(filename)}"
    candidate = (upload_dir / unique_name).resolve()

    if candidate.parent != upload_dir:
        raise HTTPException(status_code=400, detail="Invalid filename supplied.")

    return candidate


# ==============================================================================
# SYSTEM ENDPOINTS
# ==============================================================================

@app.get(
    "/",
    tags=["System"],
    summary="API root",
    description="Basic liveness message confirming the API is running.",
)
def root():
    """Return a simple confirmation that the API is running.

    Returns:
        dict: Static welcome message.
    """
    return {"message": "B-WIN MVP API Running"}


@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Reports service status, version and database connectivity.",
)
def health(db: Session = Depends(get_db)):
    """Check API and database health.

    Parameters:
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: status, service name, version, timestamp and database status.
    """
    try:
        db.execute(text("SELECT 1"))
        database_status = "connected"
    except SQLAlchemyError as exc:
        logger.error("Health check database query failed: %s", exc)
        database_status = "disconnected"

    return {
        "status": "healthy" if database_status == "connected" else "degraded",
        "service": "B-WIN MVP API",
        "version": APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": database_status,
    }


# ==============================================================================
# WORKER APIS
# ==============================================================================

@app.post(
    "/workers",
    tags=["Workers"],
    summary="Register a new worker",
    description="Creates a new worker profile with name, age, location and skill.",
    responses={
        200: {"content": {"application/json": {
            "example": {"message": "Worker registered successfully", "id": 1}
        }}},
        400: {"description": "Invalid worker data supplied."},
        500: {"description": "Database error while creating the worker."},
    },
)
def create_worker(
    worker: Worker = Body(
        ...,
        example={"name": "Ramesh Kumar", "age": 29, "location": "Bengaluru", "skill": "Electrician"},
    ),
    db: Session = Depends(get_db),
):
    """Register a new worker.

    Parameters:
        worker (Worker): Worker details submitted by the client.
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: Confirmation message and the new worker's id.
    """
    validate_worker_payload(worker)

    try:
        new_worker = WorkerDB(
            name=worker.name.strip(),
            age=worker.age,
            location=worker.location,
            skill=worker.skill.strip(),
        )
        db.add(new_worker)
        db.commit()
        db.refresh(new_worker)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Failed to create worker '%s': %s", worker.name, exc)
        raise HTTPException(status_code=500, detail="Failed to register worker. Please try again later.")

    logger.info("Worker created: id=%s name=%s", new_worker.id, new_worker.name)

    return {
        "message": "Worker registered successfully",
        "id": new_worker.id,
    }


@app.get(
    "/workers",
    tags=["Workers"],
    summary="List all workers",
    description="Retrieves every registered worker profile.",
)
def get_workers(db: Session = Depends(get_db)):
    """Retrieve all registered workers.

    Parameters:
        db (Session): Database session injected by FastAPI.

    Returns:
        list: Worker records as plain dictionaries.
    """
    try:
        workers = db.query(WorkerDB).all()
    except SQLAlchemyError as exc:
        logger.error("Failed to fetch workers: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve workers.")

    return [worker_to_dict(worker) for worker in workers]


# ==============================================================================
# JOB APIS
# ==============================================================================

@app.post(
    "/jobs",
    tags=["Jobs"],
    summary="Create a new job listing",
    description="Creates a job posting with title, company, location, required skill and salary.",
    responses={
        200: {"content": {"application/json": {
            "example": {"message": "Job created successfully", "id": 1}
        }}},
        400: {"description": "Invalid job data supplied."},
        500: {"description": "Database error while creating the job."},
    },
)
def create_job(
    job: Job = Body(
        ...,
        example={
            "title": "Site Electrician",
            "company": "ACME Constructions",
            "location": "Bengaluru",
            "required_skill": "Electrician",
            "salary": 25000,
        },
    ),
    db: Session = Depends(get_db),
):
    """Create a new job posting.

    Parameters:
        job (Job): Job details submitted by the client.
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: Confirmation message and the new job's id.
    """
    validate_job_payload(job)

    try:
        new_job = JobDB(
            title=job.title.strip(),
            company=job.company,
            location=job.location,
            required_skill=job.required_skill.strip(),
            salary=job.salary,
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Failed to create job '%s': %s", job.title, exc)
        raise HTTPException(status_code=500, detail="Failed to create job. Please try again later.")

    logger.info("Job created: id=%s title=%s", new_job.id, new_job.title)

    return {
        "message": "Job created successfully",
        "id": new_job.id,
    }


@app.get(
    "/jobs",
    tags=["Jobs"],
    summary="List all jobs",
    description="Retrieves every job posting.",
)
def get_jobs(db: Session = Depends(get_db)):
    """Retrieve all job postings.

    Parameters:
        db (Session): Database session injected by FastAPI.

    Returns:
        list: Job records as plain dictionaries.
    """
    try:
        jobs = db.query(JobDB).all()
    except SQLAlchemyError as exc:
        logger.error("Failed to fetch jobs: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve jobs.")

    return [job_to_dict(job) for job in jobs]


# ==============================================================================
# AI JOB MATCHING
# ==============================================================================

@app.get(
    "/match-jobs/{worker_id}",
    tags=["Matching"],
    summary="Find matching jobs for a worker",
    description="Runs the AI job matching engine against a worker's registered skill.",
)
def get_matched_jobs(worker_id: int, db: Session = Depends(get_db)):
    """Match a worker against all available job postings.

    Parameters:
        worker_id (int): ID of the worker to match jobs for.
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: Worker summary, matched jobs and total match count.
    """
    try:
        worker = db.query(WorkerDB).filter(WorkerDB.id == worker_id).first()
    except SQLAlchemyError as exc:
        logger.error("Database error while fetching worker %s: %s", worker_id, exc)
        raise HTTPException(status_code=500, detail="Failed to look up worker.")

    if not worker:
        logger.warning("Match request for unknown worker_id=%s", worker_id)
        raise HTTPException(status_code=404, detail="Worker not found")

    try:
        jobs = db.query(JobDB).all()
    except SQLAlchemyError as exc:
        logger.error("Database error while fetching jobs: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve jobs.")

    try:
        matched_jobs = match_jobs(worker.skill, jobs)
    except Exception as exc:  # third-party matching logic; never leak internals
        logger.error("Job matching failed for worker_id=%s: %s", worker_id, exc)
        raise HTTPException(status_code=500, detail="Job matching is currently unavailable.")

    logger.info("Matched %s jobs for worker_id=%s", len(matched_jobs), worker_id)

    return {
        "worker": {
            "id": worker.id,
            "name": worker.name,
            "skills": worker.skill,
        },
        "matched_jobs": matched_jobs,
        "total_matches": len(matched_jobs),
    }


# ==============================================================================
# CAREER ADVICE
# ==============================================================================

@app.get(
    "/career-advice/{worker_id}",
    tags=["Career Advice"],
    summary="Get personalized career advice",
    description="Generates AI-powered career advice based on a worker's registered skill.",
)
def career_advice(worker_id: int, db: Session = Depends(get_db)):
    """Generate career advice for a registered worker.

    Parameters:
        worker_id (int): ID of the worker requesting advice.
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: Worker name, skill and the generated advice.
    """
    try:
        worker = db.query(WorkerDB).filter(WorkerDB.id == worker_id).first()
    except SQLAlchemyError as exc:
        logger.error("Database error while fetching worker %s: %s", worker_id, exc)
        raise HTTPException(status_code=500, detail="Failed to look up worker.")

    if not worker:
        logger.warning("Career advice requested for unknown worker_id=%s", worker_id)
        raise HTTPException(status_code=404, detail="Worker not found")

    try:
        advice = get_career_advice(worker.skill)
    except Exception as exc:
        logger.error("Career advice generation failed for worker_id=%s: %s", worker_id, exc)
        raise HTTPException(status_code=500, detail="Career advice is currently unavailable.")

    logger.info("Career advice generated for worker_id=%s", worker_id)

    return {
        "worker": worker.name,
        "skill": worker.skill,
        "advice": advice,
    }


# ==============================================================================
# RESUME UPLOAD API
# ==============================================================================

@app.post(
    "/upload-resume",
    tags=["Resume"],
    summary="Upload and analyze a resume",
    description=(
        "Accepts a PDF, DOCX or TXT resume (max "
        f"{MAX_UPLOAD_SIZE_MB} MB), extracts skills, matches jobs and "
        "generates career advice."
    ),
)
async def upload_resume(
    file: UploadFile = File(..., description="Resume file (.pdf, .docx or .txt)"),
    db: Session = Depends(get_db),
):
    """Upload a resume and run skill extraction, job matching and career advice.

    Parameters:
        file (UploadFile): The uploaded resume file.
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: Extracted skills, matched jobs, career advice and a resume preview.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was provided.")

    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_RESUME_EXTENSIONS:
        logger.warning("Rejected upload with unsupported extension: %s", file_extension)
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed types: PDF, DOCX, TXT.",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
        logger.warning("Rejected oversized upload: %s bytes", len(file_bytes))
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds the {MAX_UPLOAD_SIZE_MB} MB upload limit.",
        )

    file_path = build_upload_path(file.filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
    except OSError as exc:
        logger.error("Failed to save uploaded file '%s': %s", file.filename, exc)
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")

    logger.info("Resume uploaded: %s (%s bytes)", file.filename, len(file_bytes))

    try:
        resume_text = extract_text(str(file_path))
    except Exception as exc:
        logger.error("Resume text extraction failed for '%s': %s", file.filename, exc)
        raise HTTPException(status_code=500, detail="Could not read the uploaded resume.")

    try:
        detected_skills = extract_skills(resume_text)
    except Exception as exc:
        logger.error("Skill extraction failed for '%s': %s", file.filename, exc)
        raise HTTPException(status_code=500, detail="Could not extract skills from the resume.")

    try:
        jobs = db.query(JobDB).all()
    except SQLAlchemyError as exc:
        logger.error("Database error while fetching jobs for resume match: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve job listings.")

    skills_text = ", ".join(detected_skills)

    try:
        matched_jobs = match_jobs(skills_text, jobs)
    except Exception as exc:
        logger.error("Job matching failed for resume '%s': %s", file.filename, exc)
        raise HTTPException(status_code=500, detail="Job matching is currently unavailable.")

    try:
        career_advice_text = get_career_advice(skills_text)
    except Exception as exc:
        logger.error("Career advice generation failed for resume '%s': %s", file.filename, exc)
        raise HTTPException(status_code=500, detail="Career advice is currently unavailable.")

    logger.info(
        "Resume processed: %s | %s skills | %s job matches",
        file.filename, len(detected_skills), len(matched_jobs),
    )

    return {
        "success": True,
        "filename": file.filename,
        "skills": detected_skills,
        "total_skills": len(detected_skills),
        "resume_preview": resume_text[:500],
        "matched_jobs": matched_jobs,
        "total_matches": len(matched_jobs),
        "career_advice": career_advice_text,
    }


# ==============================================================================
# GLOBAL EXCEPTION HANDLER
# ==============================================================================

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all handler that prevents raw tracebacks from reaching clients.

    Parameters:
        request (Request): The incoming request that triggered the error.
        exc (Exception): The unhandled exception.

    Returns:
        JSONResponse: A generic 500 error response.
    """
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method, request.url.path, exc, exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# ==============================================================================
# DEMO DATA SEEDER (for hackathon / presentations)
# ==============================================================================

@app.post(
    "/seed-demo-data",
    tags=["System"],
    summary="Seed demo workers and jobs",
    description="Populates the database with realistic demo data for presentations. Safe to call multiple times.",
)
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed realistic demo workers and jobs for hackathon demos."""

    demo_workers = [
        {"name": "Ramesh Kumar", "age": 32, "location": "Bengaluru", "skill": "electrician, wiring, solar installation"},
        {"name": "Suresh Babu", "age": 28, "location": "Chennai", "skill": "plumber, pipe fitting, drainage systems"},
        {"name": "Anitha Devi", "age": 35, "location": "Hyderabad", "skill": "tailoring, embroidery, sewing"},
        {"name": "Ravi Shankar", "age": 40, "location": "Mumbai", "skill": "welder, fabrication, TIG welding"},
        {"name": "Priya Nair", "age": 26, "location": "Pune", "skill": "python, react, javascript, sql"},
        {"name": "Mohammed Rafiq", "age": 38, "location": "Delhi", "skill": "carpenter, furniture design, woodwork"},
        {"name": "Kavitha Reddy", "age": 29, "location": "Bengaluru", "skill": "python, machine learning, data analysis"},
        {"name": "Sanjay Verma", "age": 45, "location": "Kolkata", "skill": "construction, civil work, project management"},
    ]

    demo_jobs = [
        {"title": "Senior Electrician", "company": "Tata Power Solar", "location": "Bengaluru", "required_skill": "electrician, solar installation, wiring", "salary": 35000},
        {"title": "Plumbing Supervisor", "company": "L&T Construction", "location": "Chennai", "required_skill": "plumber, pipe fitting, drainage systems", "salary": 28000},
        {"title": "MIG Welder", "company": "BHEL", "location": "Hyderabad", "required_skill": "welder, fabrication, MIG welding", "salary": 32000},
        {"title": "Python Developer", "company": "Infosys", "location": "Bengaluru", "required_skill": "python, sql, git", "salary": 75000},
        {"title": "Garment Supervisor", "company": "Madura Fashion", "location": "Coimbatore", "required_skill": "tailoring, embroidery, sewing", "salary": 22000},
        {"title": "Site Carpenter", "company": "Prestige Group", "location": "Bengaluru", "required_skill": "carpenter, carpentry, woodwork", "salary": 26000},
        {"title": "ML Engineer", "company": "Flipkart", "location": "Bengaluru", "required_skill": "python, machine learning, data analysis", "salary": 120000},
        {"title": "Construction Foreman", "company": "DLF Limited", "location": "Gurugram", "required_skill": "construction, civil work, project management", "salary": 45000},
        {"title": "Industrial Electrician", "company": "Siemens India", "location": "Pune", "required_skill": "electrician, plc, automation", "salary": 42000},
        {"title": "React Developer", "company": "Razorpay", "location": "Bengaluru", "required_skill": "react, javascript, sql", "salary": 90000},
    ]

    added_workers = 0
    added_jobs = 0

    try:
        existing_workers = db.query(WorkerDB).count()
        if existing_workers == 0:
            for w in demo_workers:
                db.add(WorkerDB(**w))
            added_workers = len(demo_workers)

        existing_jobs = db.query(JobDB).count()
        if existing_jobs == 0:
            for j in demo_jobs:
                db.add(JobDB(**j))
            added_jobs = len(demo_jobs)

        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Failed to seed demo data: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to seed demo data.")

    return {
        "message": "Demo data seeded successfully",
        "workers_added": added_workers,
        "jobs_added": added_jobs,
        "note": "Data only added if tables were empty."
    }