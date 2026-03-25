from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from features.data.data_model import Data  # adjust import based on your project
from .history_dto import DisplayNeededHistoryData 
from features.ungroup.dto_ungroup import UngroupedDataResponse, SampleResponseDTO  

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
    
    def delete_multiple_history(self, instructor_id: str, data_ids: list[int]):
        records = (
            self.db.query(Data)
            .filter(
                Data.DataId.in_(data_ids),
                Data.instructor_id == instructor_id
            )
            .all()
        )

        if not records:
            raise HTTPException(
                status_code=404,
                detail="No records found or not authorized"
            )

        deleted_ids = [record.DataId for record in records]

        for record in records:
            self.db.delete(record)

        self.db.commit()

        return {
            "message": "Records deleted successfully",
            "deleted_ids": deleted_ids
        }