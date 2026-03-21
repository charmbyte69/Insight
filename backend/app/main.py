from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from features.ungroup.router_ungroup import router as sample_router 
from features.auth.router import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Feature Based FastAPI")

# Allow React frontend
origins = [
    "http://localhost:5173",  # Vite React
    "http://localhost:3000",  # CRA React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(sample_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "API Running"}