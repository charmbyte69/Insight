from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column

class Data(Base):
    __tablename__ = "InstructorData"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    DataId: Mapped[int]
    instructor_id: Mapped[str]
    Values: Mapped[str]
    Min: Mapped[int]
    Max: Mapped[int]
    Class_interval: Mapped[int]
    FileName: Mapped[str]
    FileType: Mapped[str]
    Date: Mapped[str]
    Time: Mapped[str]