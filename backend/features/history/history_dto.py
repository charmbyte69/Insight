from pydantic import BaseModel
from typing import List

class DisplayNeededHistoryData(BaseModel):
    DataId: int
    FileName: str
    FileType: str
    Date: str   
    Time: str
    instructor_id: str

class DeleteHistoryRequest(BaseModel):
    data_ids: List[int]