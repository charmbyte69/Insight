# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys
import webbrowser
import threading
import time

from app.database import engine, Base
from features.auth.router import router as auth_router
from features.data.router import router as data_router
from features.history.history_router import router as history_router

# Create database tables
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
app.include_router(data_router)
app.include_router(history_router)

# Serve React frontend
if getattr(sys, "frozen", False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.dirname(__file__)

frontend_path = os.path.join(base_path, "app", "static", "dist")

if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
def root():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "API Running"}


# -----------------------
# AUTO OPEN BROWSER
# -----------------------
def open_browser():
    """Open browser after slight delay to ensure server starts."""
    time.sleep(1)
    try:
        webbrowser.open("http://127.0.0.1:8000")
    except:
        pass


if __name__ == "__main__":
    import uvicorn

    threading.Thread(target=open_browser).start()

    uvicorn.run(app, host="127.0.0.1", port=8000)