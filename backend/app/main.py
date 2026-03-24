from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from features.auth.router import router as auth_router
from features.data.router import router as data_router  # correct import
from features.history.history_router import router as history_router  # correct import

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Feature Based FastAPI")

# CORS
origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(data_router)  # <-- this makes /data/process available
app.include_router(history_router)

@app.get("/")
def root():
    return {"message": "API Running"}