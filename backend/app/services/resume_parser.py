import fitz  # PyMuPDF
import spacy

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

KNOWN_SKILLS = [
    "python",
    "java",
    "c",
    "c++",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "react",
    "angular",
    "vue",
    "javascript",
    "typescript",
    "html",
    "css",
    "fastapi",
    "flask",
    "django",
    "node",
    "express",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "git",
    "github",
    "linux",
    "tensorflow",
    "pytorch",
    "opencv",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "pandas",
    "numpy",
    "scikit-learn"
]


def extract_text(pdf_path):
    """
    Extract text from a PDF file.
    """
    document = fitz.open(pdf_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


def extract_skills(text):
    """
    Detect known skills from resume text.
    """
    text = text.lower()

    found_skills = []

    for skill in KNOWN_SKILLS:
        if skill in text:
            found_skills.append(skill)

    return sorted(list(set(found_skills)))