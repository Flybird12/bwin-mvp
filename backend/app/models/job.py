from pydantic import BaseModel

class Job(BaseModel):
    title: str
    company: str
    location: str
    required_skill: str
    salary: int