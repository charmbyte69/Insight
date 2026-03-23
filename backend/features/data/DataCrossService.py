from sqlalchemy.orm import Session
from fastapi import HTTPException
import json
from .dto import GenerateDataResponseDTO, GetDataOnDb, UngroupRequiredDataDto
from .data_model import Data
from features.ungroup.service_ungroup import SampleService as process_ungroup_data
from features.ungroup.dto_ungroup import SampleRequestDTO

def get_recent_data(db: Session, instructor_id: str):
    # Get the most recent record
    recent_data = (
        db.query(Data)
        .filter(Data.instructor_id == instructor_id)
        .order_by(Data.id.desc())
        .first()
    )

    if not recent_data:
        raise HTTPException(
            status_code=404,
            detail="No data found for this instructor"
        )

    # Convert Values from string → list[int]
    try:
        values = json.loads(recent_data.Values)
        data_id = recent_data.DataId
        if not isinstance(values, list) or not all(isinstance(x, int) for x in values):
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Invalid Values format in database"
        )

    ungroup_data_result = calculate_data(UngroupRequiredDataDto(
        Min=recent_data.Min,
        Max=recent_data.Max,
        Values=values
    ),
        data_id
    )

    # Return using your DTO
    return ungroup_data_result
    
def calculate_data(data: UngroupRequiredDataDto, data_id: int):
    
    request_dto = SampleRequestDTO(
        min=data.Min,
        max=data.Max,
        values=data.Values
    )
    result = process_ungroup_data.process_data(request_dto, data_id)  # Pass dummy user_id for now
    return result
