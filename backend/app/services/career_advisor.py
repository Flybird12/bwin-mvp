def get_career_advice(skill):

    skill = skill.lower()

    if skill == "electrician":
        return {
            "next_skills": [
                "PLC Programming",
                "Industrial Automation",
                "Motor Control"
            ],
            "salary_growth": "₹30,000 → ₹55,000",
            "companies": [
                "Tata Power",
                "ABB",
                "Siemens"
            ]
        }

    if skill == "construction supervisor":
        return {
            "next_skills": [
                "Project Management",
                "AutoCAD",
                "Site Planning"
            ],
            "salary_growth": "₹45,000 → ₹80,000",
            "companies": [
                "L&T",
                "Shapoorji Pallonji",
                "Afcons"
            ]
        }

    return {
        "next_skills": ["Communication"],
        "salary_growth": "Depends on experience",
        "companies": []
    }