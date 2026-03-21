from fastapi import APIRouter, Depends
from .schema import DataInput
from .service import process_data
from app.security import get_current_user


router = APIRouter(prefix="/data", tags=["data"])

@router.post("/process")
def process(
    input_data: DataInput,
    current_user = Depends(get_current_user)  # JWT required
):
    user_id = current_user["user_id"]

    result = process_data(input_data.values, input_data.class_interval)

    return {
        "user_id": user_id,
        "result": result
    }