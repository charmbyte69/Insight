from pydantic import BaseModel

class GetNeededHistoryDisplay(BaseModel):
    DataId: int
    FileName: str
    FileType: str
    Date: str   
    Time: str