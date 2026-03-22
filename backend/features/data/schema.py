from pydantic import BaseModel
from typing import List
 
class AddData(BaseModel):
    DataId: int
    Values: List[int]
    FileName: str
    FileType: str
    Date: str
    Time: str

class AddDataResponse(BaseModel):
    DataId: int
    Message: str



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