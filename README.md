# B-WIN (Bridge to Workforce with Intelligent Navigation)

B-WIN is an AI-powered job recommendation platform that helps job seekers upload their resumes, extract skills, receive career advice, and find matching job opportunities based on their technical skills.

## Features

- AI Resume Upload & Parsing
- Automatic Skill Extraction
- AI Job Matching
- Career Advice Generator
- Worker Registration
- Job Creation
- PostgreSQL Database (Neon)
- FastAPI Backend
- React Frontend

---

## Tech Stack

### Frontend
- React.js
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Python

### Database
- PostgreSQL (Neon)

---

## Project Structure

```
bwin-mvp/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models/
│   │   ├── services/
│   │   └── routes/
│   │
│   ├── uploads/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/Flybird12/bwin-mvp.git
cd bwin-mvp
```

---

## 2. Backend Setup

Navigate to the backend folder.

```bash
cd backend
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate the virtual environment.

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```cmd
venv\Scripts\activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

---

## 3. Configure Database

Create a `.env` file inside the backend directory.

```
DATABASE_URL=your_neon_database_url
```

Example:

```
DATABASE_URL=postgresql://username:password@hostname/database
```

---

## 4. Run Backend

```bash
uvicorn app.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

## 5. Frontend Setup

Open a new terminal.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# API Endpoints

## Worker APIs

### Register Worker

```
POST /workers
```

### Get Workers

```
GET /workers
```

---

## Job APIs

### Create Job

```
POST /jobs
```

### Get Jobs

```
GET /jobs
```

---

## AI APIs

### Resume Upload

```
POST /upload-resume
```

Returns:

- Extracted Skills
- Resume Preview
- Matching Jobs
- Match Percentage
- Career Advice

### Job Matching

```
GET /match-jobs/{worker_id}
```

### Career Advice

```
GET /career-advice/{worker_id}
```

---

# Current Workflow

```
Upload Resume
        │
        ▼
Extract Resume Text
        │
        ▼
Extract Skills
        │
        ▼
Match Jobs
        │
        ▼
Career Advice
        │
        ▼
Display Results
```

---

# Future Improvements

- JWT Authentication
- Recruiter Dashboard
- Resume Ranking
- Email Notifications
- Admin Dashboard
- Resume Scoring
- Deployment (Render + Vercel)

---

# Screenshots

Add screenshots of:

- Dashboard
- Resume Upload
- Job Matching
- Career Advice
- Swagger API

---

# Author

**Preetham L Singh**

Computer Science and Engineering

Sir M. Visvesvaraya Institute of Technology

GitHub: https://github.com/Flybird12

---

# License

This project is developed for educational and placement purposes.
