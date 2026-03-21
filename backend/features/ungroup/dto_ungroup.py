from pydantic import BaseModel
from typing import List, Dict

class SampleRequestDTO(BaseModel):
    min: int
    max: int
    values: List[int]

class UngroupedDataResponse(BaseModel):
    mean: float
    mode: List[float]
    median: float
    frequency_table: Dict[int, int]
    sorted_dataset: List[float]

class SampleResponseDTO(BaseModel):
    Instructor_ID: int
    message: str
    filtered_values: List[int]
    # This is where the "passed" data results will live
    statistics: UngroupedDataResponse