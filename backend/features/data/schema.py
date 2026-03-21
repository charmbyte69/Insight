from pydantic import BaseModel
from typing import List

class DataInput(BaseModel):
    values: List[float]
    class_interval: float

class IntervalRow(BaseModel):
    interval: str
    f: int
    xi: float
    fixi: float
    cf: int

class DataResponseDTO(BaseModel):
    user_id: int
    range: float
    mean: float
    median: float
    mode: float
    table: List[IntervalRow]