from sqlalchemy.orm import Session
from fastapi import HTTPException
import json
from .dto import GenerateDataResponseDTO, GetDataOnDb, GroupDataRequiredDataDto, UngroupRequiredDataDto
from .data_model import Data
from features.ungroup.service_ungroup import SampleService as process_ungroup_data
from features.ungroup.dto_ungroup import SampleRequestDTO
from .service import process_data as process_group_data

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

    group_data_result = calculate_group_data(GroupDataRequiredDataDto(
        Min=recent_data.Min,
        Max=recent_data.Max,
        Class_interval=recent_data.Class_interval,
        Values=values
    ))

    # Return using your DTO
    return { "ungroup_data": ungroup_data_result, "group_data": group_data_result}
    
def get_data_by_data_id(db: Session, data_id: str, instructor_id: str):
    data = (
        db.query(Data)
        .filter(
            Data.DataId == data_id,
            Data.instructor_id == instructor_id
        )
        .first()
    )

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data not found or not authorized"
        )

    # Convert Values
    try:
        values = json.loads(data.Values)
        if not isinstance(values, list) or not all(isinstance(x, int) for x in values):
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Invalid Values format in database"
        )

    # Process ungrouped
    ungroup_data_result = calculate_data(
        UngroupRequiredDataDto(
            Min=data.Min,
            Max=data.Max,
            Values=values
        ),
        data.DataId
    )

    # Process grouped
    group_data_result = calculate_group_data(
        GroupDataRequiredDataDto(
            Min=data.Min,
            Max=data.Max,
            Class_interval=data.Class_interval,
            Values=values
        )
    )

    return {
        "ungroup_data": ungroup_data_result,
        "group_data": group_data_result
    }


def calculate_data(data: UngroupRequiredDataDto, data_id: int):
    
    request_dto = SampleRequestDTO(
        min=data.Min,
        max=data.Max,
        values=data.Values
    )
    result = process_ungroup_data.process_data(request_dto, data_id)
    return result

def calculate_group_data(data: GroupDataRequiredDataDto):
    result = process_group_data(data.Values, data.Class_interval, data.Min, data.Max)
    return result
    
