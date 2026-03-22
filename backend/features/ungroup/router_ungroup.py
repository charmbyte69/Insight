from fastapi import APIRouter, Depends
from .dto_ungroup import SampleRequestDTO, SampleResponseDTO
from .service_ungroup import SampleService
from app.security import get_current_user

router = APIRouter(prefix="/sample", tags=["Sample"])

@router.post("/ungroup", response_model=SampleResponseDTO)
def process_sample(
    request: SampleRequestDTO,
    user=Depends(get_current_user)
):
    user_id = user.get("user_id")
    # This single call now handles Filtering -> Passing -> Calculating
    return SampleService.process_data(request, user_id)