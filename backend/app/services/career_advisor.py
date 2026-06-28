"""
Career advisor — uses OpenAI when available, falls back to a rich
rule-based engine so the app always works even without an API key.
"""

import os
import json
import logging

logger = logging.getLogger("bwin")

# ---------------------------------------------------------------------------
# Rich rule-based fallback (covers common blue-collar + tech roles)
# ---------------------------------------------------------------------------

ADVICE_DB = {
    "electrician": {
        "next_skills": ["PLC Programming", "Industrial Automation", "Solar Installation", "Motor Control"],
        "salary_growth": "₹18,000 → ₹55,000",
        "companies": ["Tata Power", "ABB", "Siemens", "Adani Green Energy"],
        "career_path": "Electrician → Senior Electrician → Electrical Supervisor → Electrical Engineer",
        "certifications": ["ITI Electrician", "NSDC Certification", "ISI Wiring Certificate"],
        "social_impact": "Skilled electricians power homes and industries across India, directly improving quality of life."
    },
    "plumber": {
        "next_skills": ["Pipe Fitting", "CPVC Installation", "Drainage Systems", "Water Treatment"],
        "salary_growth": "₹15,000 → ₹45,000",
        "companies": ["L&T", "Shapoorji Pallonji", "NCC Limited", "Sobha Developers"],
        "career_path": "Plumber → Senior Plumber → Plumbing Supervisor → Site Engineer",
        "certifications": ["ITI Plumber", "NSDC Plumbing", "Green Plumber Certificate"],
        "social_impact": "Access to clean water and sanitation is a basic right — plumbers make that possible."
    },
    "welder": {
        "next_skills": ["TIG Welding", "MIG Welding", "Structural Fabrication", "Quality Inspection"],
        "salary_growth": "₹16,000 → ₹50,000",
        "companies": ["BHEL", "SAIL", "Larsen & Toubro", "Tata Steel"],
        "career_path": "Welder → Senior Welder → Welding Inspector → Production Supervisor",
        "certifications": ["ITI Welder", "AWS Certified Welder", "ASME Welding Certification"],
        "social_impact": "Welders build India's infrastructure — bridges, pipelines, and factories."
    },
    "carpenter": {
        "next_skills": ["Interior Design Basics", "CNC Machine Operation", "Furniture Design", "Project Estimation"],
        "salary_growth": "₹14,000 → ₹42,000",
        "companies": ["Godrej Interio", "Spacewood", "Featherlite", "Local Contractors"],
        "career_path": "Carpenter → Senior Carpenter → Foreman → Interior Works Contractor",
        "certifications": ["ITI Carpenter", "NSDC Furniture & Fittings"],
        "social_impact": "Skilled carpenters build affordable housing and furniture for millions of families."
    },
    "driver": {
        "next_skills": ["Heavy Vehicle License", "Logistics Management", "GPS Navigation", "First Aid"],
        "salary_growth": "₹12,000 → ₹35,000",
        "companies": ["Delhivery", "Blue Dart", "DTDC", "Amazon Logistics", "Uber Freight"],
        "career_path": "Driver → Senior Driver → Fleet Supervisor → Logistics Coordinator",
        "certifications": ["HMV License", "Defensive Driving Certificate", "Hazmat Transport License"],
        "social_impact": "Drivers keep supply chains moving, ensuring goods reach every corner of India."
    },
    "construction": {
        "next_skills": ["AutoCAD", "Site Safety (OSHA)", "Project Planning", "Cost Estimation"],
        "salary_growth": "₹18,000 → ₹65,000",
        "companies": ["L&T Construction", "DLF", "Prestige Group", "Puravankara"],
        "career_path": "Worker → Site Supervisor → Project Manager → Construction Director",
        "certifications": ["NSDC Construction", "Safety Officer Certificate", "PMP Certification"],
        "social_impact": "Construction workers build the schools, hospitals, and homes that shape communities."
    },
    "mechanic": {
        "next_skills": ["EV Servicing", "Engine Diagnostics", "CNC Operation", "Quality Control"],
        "salary_growth": "₹15,000 → ₹48,000",
        "companies": ["Bosch", "Maruti Suzuki", "Tata Motors", "Hero MotoCorp"],
        "career_path": "Mechanic → Senior Mechanic → Workshop Supervisor → Service Manager",
        "certifications": ["ITI Mechanic", "Maruti Skill Training", "EV Technician Certificate"],
        "social_impact": "Mechanics keep vehicles running for millions who depend on them for their livelihood."
    },
    "python": {
        "next_skills": ["Django/FastAPI", "Machine Learning", "Cloud (AWS/GCP)", "System Design"],
        "salary_growth": "₹30,000 → ₹1,20,000",
        "companies": ["Infosys", "TCS", "Flipkart", "Razorpay", "Swiggy"],
        "career_path": "Junior Dev → Developer → Senior Dev → Tech Lead → Engineering Manager",
        "certifications": ["Python Institute PCEP", "Google Cloud Associate", "AWS Solutions Architect"],
        "social_impact": "Tech skills help bridge the digital divide and create high-paying opportunities."
    },
}

def _find_best_match(skill_input: str) -> dict | None:
    """Find the best matching advice from the DB."""
    skill_lower = skill_input.lower()
    # Exact match first
    if skill_lower in ADVICE_DB:
        return ADVICE_DB[skill_lower]
    # Partial match
    for key, advice in ADVICE_DB.items():
        if key in skill_lower or skill_lower in key:
            return advice
    # Multi-skill: check comma-separated list
    skills = [s.strip().lower() for s in skill_lower.split(",")]
    for skill in skills:
        for key, advice in ADVICE_DB.items():
            if key in skill or skill in key:
                return advice
    return None


def _openai_advice(skill: str) -> dict | None:
    """Call OpenAI to generate career advice. Returns None on failure."""
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return None

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        prompt = f"""You are a career advisor for blue-collar and skilled workers in India.
A worker has the following skill(s): "{skill}"

Return a JSON object with these exact keys:
{{
  "next_skills": ["skill1", "skill2", "skill3", "skill4"],
  "salary_growth": "₹XX,000 → ₹YY,000 (monthly)",
  "companies": ["Company1", "Company2", "Company3"],
  "career_path": "Current Role → Next Role → Senior Role → Management",
  "certifications": ["Cert1", "Cert2"],
  "social_impact": "One sentence on the social impact of this profession in India."
}}

Use Indian Rupees. Focus on Indian companies and opportunities. Be specific and realistic."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())

    except Exception as exc:
        logger.warning("OpenAI career advice failed: %s — using fallback.", exc)
        return None


def get_career_advice(skill: str) -> dict:
    """
    Get career advice for a given skill.
    Tries OpenAI first, then falls back to the rule-based database,
    then returns a generic response.
    """
    # 1. Try OpenAI
    ai_result = _openai_advice(skill)
    if ai_result:
        logger.info("Career advice generated via OpenAI for skill: %s", skill)
        return ai_result

    # 2. Rule-based fallback
    fallback = _find_best_match(skill)
    if fallback:
        logger.info("Career advice served from rule-based DB for skill: %s", skill)
        return fallback

    # 3. Generic response
    logger.info("Generic career advice returned for unknown skill: %s", skill)
    return {
        "next_skills": ["Communication Skills", "Digital Literacy", "Safety Training", "First Aid"],
        "salary_growth": "Varies by experience and location",
        "companies": ["Local contractors", "MSMEs", "Government schemes"],
        "career_path": "Worker → Senior Worker → Supervisor → Manager",
        "certifications": ["NSDC Skill India Certification", "State Skill Development Certificate"],
        "social_impact": "Every skilled worker contributes to India's growth and their family's prosperity."
    }