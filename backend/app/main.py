# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import *
from .routers import sms_router, transactions_router, savings_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TajiriCircle FastAPI backend")

# CORS (allow your frontend)
origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sms_router.router)
app.include_router(transactions_router.router)
app.include_router(savings_router.router)

@app.on_event("startup")
def on_startup():
    # Create DB tables (hackathon style)
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(bind=engine)
