from sqlalchemy.orm import Session
from fastapi import HTTPException
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