from pydantic import BaseModel, validator

class RegisterRequest(BaseModel):

    instructor_id: str
    name: str
    password: str

class LoginRequest(BaseModel):

    instructor_id: str
    password: str

class TokenResponse(BaseModel):

    Welcome_user: str
    access_token: str
    token_type: str = "bearer"