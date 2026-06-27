def match_jobs(worker_skill, jobs):
    worker_skills = {
        skill.strip().lower()
        for skill in worker_skill.split(",")
    }

    matched_jobs = []

    for job in jobs:
        job_skills = {
            skill.strip().lower()
            for skill in job.required_skill.split(",")
        }

        common_skills = worker_skills.intersection(job_skills)

        if common_skills:
            match_percentage = int(
                (len(common_skills) / len(job_skills)) * 100
            )

            matched_jobs.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "salary": job.salary,
                "match_percentage": match_percentage,
                "matched_skills": list(common_skills),
                "missing_skills": list(job_skills - worker_skills)
            })

    matched_jobs.sort(
        key=lambda x: x["match_percentage"],
        reverse=True
    )

    return matched_jobs
