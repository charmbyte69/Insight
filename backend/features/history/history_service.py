from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from features.data.data_model import Data  # adjust import based on your project
from .history_dto import DisplayNeededHistoryData  # adjust path if needed


class HistoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_history_by_instructor(self, instructor_id: str) -> List[DisplayNeededHistoryData]:
        records = (
            self.db.query(Data)
            .filter(Data.instructor_id == instructor_id)
            .order_by(Data.id.desc())
            .all()
        )

        if not records:
            return []

        result = []
        for row in records:
            result.append(
                DisplayNeededHistoryData(
                    DataId=row.DataId,
                    FileName=row.FileName,
                    FileType=row.FileType,
                    Date=row.Date,   # adjust if datetime
                    Time=row.Time,    # adjust if datetime
                    instructor_id=row.instructor_id  # adjust if datetime
                )
            )

        return result
    
    def delete_history_by_dataid(self, instructor_id: str, data_id: int):
        record = (
            self.db.query(Data)
            .filter(Data.DataId == data_id, Data.instructor_id == instructor_id)
            .first()
        )

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found or not authorized to delete"
            )

        self.db.delete(record)
        self.db.commit()
        return {"message": f"Record {data_id} deleted successfully."}