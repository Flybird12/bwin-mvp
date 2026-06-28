import fitz  # PyMuPDF
import re

# Expanded skill list covering both blue-collar AND tech workers
KNOWN_SKILLS = [
    # --- Blue-collar / Trade ---
    "electrician", "plumber", "plumbing", "carpenter", "carpentry",
    "welder", "welding", "mason", "masonry", "painter", "painting",
    "mechanic", "mechanical", "driver", "driving", "heavy vehicle",
    "construction", "civil work", "tiling", "flooring", "roofing",
    "hvac", "air conditioning", "refrigeration", "fabrication",
    "pipefitter", "ironworker", "scaffolding", "earthmoving",
    "equipment operator", "forklift", "crane operator",
    "electrician", "wiring", "switchboard", "solar installation",
    "plc", "automation", "industrial maintenance",
    "tailoring", "embroidery", "sewing",
    "cooking", "chef", "kitchen", "food processing",
    "security guard", "security", "housekeeping", "cleaning",
    "gardening", "landscaping", "agriculture", "farming",
    "delivery", "logistics", "warehouse",

    # --- Tech ---
    "python", "java", "c", "c++", "sql", "mysql", "postgresql",
    "mongodb", "react", "angular", "vue", "javascript", "typescript",
    "html", "css", "fastapi", "flask", "django", "node", "express",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github",
    "linux", "tensorflow", "pytorch", "opencv",
    "machine learning", "deep learning", "artificial intelligence",
    "pandas", "numpy", "scikit-learn", "data analysis",
    "project management", "autocad", "ms office",

    # --- Soft skills that appear in resumes ---
    "communication", "leadership", "teamwork", "problem solving",
]

# Deduplicate while preserving order
seen = set()
KNOWN_SKILLS_DEDUPED = []
for s in KNOWN_SKILLS:
    if s not in seen:
        seen.add(s)
        KNOWN_SKILLS_DEDUPED.append(s)
KNOWN_SKILLS = KNOWN_SKILLS_DEDUPED


def extract_text(file_path: str) -> str:
    """Extract text from PDF, DOCX, or TXT file."""
    path = file_path.lower()

    if path.endswith(".pdf"):
        document = fitz.open(file_path)
        text = ""
        for page in document:
            text += page.get_text()
        document.close()
        return text

    elif path.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except ImportError:
            # Fallback: read as plain text
            with open(file_path, "r", errors="ignore") as f:
                return f.read()

    else:  # .txt
        with open(file_path, "r", errors="ignore") as f:
            return f.read()


def extract_skills(text: str) -> list[str]:
    """Detect known skills from resume text using word-boundary matching."""
    text_lower = text.lower()
    found_skills = []

    for skill in KNOWN_SKILLS:
        # Use word boundaries so "c" doesn't match inside "electrician"
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)

    return sorted(list(set(found_skills)))


def categorize_skills(skills: list[str]) -> dict:
    """Categorize skills into blue-collar vs tech for the UI."""
    blue_collar_keywords = {
        "electrician", "plumber", "plumbing", "carpenter", "carpentry",
        "welder", "welding", "mason", "masonry", "painter", "painting",
        "mechanic", "mechanical", "driver", "driving", "heavy vehicle",
        "construction", "civil work", "tiling", "flooring", "roofing",
        "hvac", "air conditioning", "refrigeration", "fabrication",
        "pipefitter", "ironworker", "scaffolding", "earthmoving",
        "equipment operator", "forklift", "crane operator", "wiring",
        "switchboard", "solar installation", "plc", "automation",
        "industrial maintenance", "tailoring", "embroidery", "sewing",
        "cooking", "chef", "kitchen", "food processing",
        "security guard", "security", "housekeeping", "cleaning",
        "gardening", "landscaping", "agriculture", "farming",
        "delivery", "logistics", "warehouse",
    }
    trade = [s for s in skills if s in blue_collar_keywords]
    tech = [s for s in skills if s not in blue_collar_keywords]
    return {"trade_skills": trade, "tech_skills": tech}