from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from typing import List
from features.ungroup.dto_ungroup import SampleResponseDTO

class GetDataOnDb(BaseModel):
    DataId: int
    Values: List[int]
    Min: int
    Max: int
    Class_interval: int


class UngroupRequiredDataDto(BaseModel):
    Min: int
    Max: int
    Values: List[int]

class GenerateDataResponseDTO(BaseModel):
    DataId: int
    UngroupData: SampleResponseDTO
    

class GroupDataRequiredDataDto(BaseModel):
    Min: int
    Max: int
    Class_interval: int
    Values: List[int]