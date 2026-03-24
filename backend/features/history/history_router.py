from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db  # your DB dependency
from .history_service import HistoryService
from .history_dto import DisplayNeededHistoryData
from app.security import get_current_user  # your JWT function
from .history_dto import DeleteHistoryRequest

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=List[DisplayNeededHistoryData])
def get_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # JWT validation
):
    instructor_id = current_user.get("instructor_id")  # Extract instructor_id from JWT payload

    service = HistoryService(db)
    result = service.get_history_by_instructor(instructor_id)

    return result

@router.delete("/")
def delete_history(
    request: DeleteHistoryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    instructor_id = current_user.get("instructor_id")

    service = HistoryService(db)
    result = service.delete_multiple_history(instructor_id, request.data_ids)

    return result