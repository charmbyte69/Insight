from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from features.ungroup.dto_ungroup import SampleResponseDTO
from .schema import AddData
from .service import process_data, create_data
from app.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/data", tags=["data"])

# ----------------- /process endpoint -----------------
@router.post("/process")
def process(
    input_data: AddData,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user_id"]
    result = process_data(input_data.Values, input_data.Class_interval)

    return {
        "title": "Group Data",
        "user_id": user_id,
        "mean": result["mean"],
        "median": result["median"],
        "mode": result["mode"],
        "table": result["table"]
    }

# ----------------- /add_data endpoint -----------------
@router.post("/add_data")
def add_data(
    data: AddData,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_data = create_data(db, data, current_user)
    return {
        "message": "Data added successfully",
        "data_id": db_data.DataId,
        "instructor_id": db_data.instructor_id
    }