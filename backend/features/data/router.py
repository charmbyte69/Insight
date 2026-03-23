from fastapi import APIRouter, Depends, HTTPException

from features.ungroup.dto_ungroup import SampleResponseDTO
from .schema import AddData
from .dto import GetDataOnDb, GenerateDataResponseDTO
from .DataCrossService import get_recent_data
from .service import process_data
from app.security import get_current_user
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from .service import create_data

router = APIRouter(prefix="/data", tags=["data"])

@router.post("/process")
def process(
    input_data: AddData,
    current_user = Depends(get_current_user)  # JWT required
):
    user_id = current_user["user_id"]

    result = process_data(input_data.Values, input_data.Class_interval)

    return {
        "user_id": user_id,
        "result": result
    }

@router.post("/add_data")
def add_data(
    data: AddData,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_data = create_data(db, data, current_user)

    return {
        "message": "Data added successfully",
        "data_id": db_data.DataId,
        "instructor_id": db_data.instructor_id
    }

@router.get("/{instructor_id}", response_model=SampleResponseDTO)
def get_recent(
    instructor_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the most recent data for a given instructor_id.
    Returns:
        GetDataOnDb: DataId and Values list[int]
    """

    if instructor_id != current_user.instructor_id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this instructor's data"
        )
    
    try:
        recent_data = get_recent_data(db, instructor_id)
    except HTTPException as e:
        # propagate 404 or 500 from service
        raise e

    return recent_data