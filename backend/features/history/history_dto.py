from pydantic import BaseModel

class DisplayNeededHistoryData(BaseModel):
    DataId: int
    FileName: str
    FileType: str
    Date: str   
    Time: str
    instructor_id: str