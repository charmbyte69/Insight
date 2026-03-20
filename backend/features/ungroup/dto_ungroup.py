from pydantic import BaseModel, Field
from typing import List

class SampleRequestDTO(BaseModel):
    min: int
    max: int
    values: List[int]

class SampleResponseDTO(BaseModel):
    Instructor_ID: int
    message: str
    filtered_values: List[int]