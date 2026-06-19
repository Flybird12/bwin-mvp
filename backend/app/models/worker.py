from pydantic import BaseModel

class Worker(BaseModel):
    name: str
    age: int
    location: str
    skill: str
    