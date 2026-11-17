from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.router import router
from fastapi.routing import APIRoute
import uvicorn
import database as db
from middleware.HeaderSecurity import SecurityHeader
from models.auditLog import Audit_logs
from loguru import logger
import sys
import os
from middleware.rateLimiter import RateLimit
logger.remove()

logger.add(sys.stderr, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

logger.add(
    "logs/systems.log",
    rotation="100 MB",
    retention="30 days",
    compression="zip",
    level="INFO"
)

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.add_middleware(SecurityHeader)
app.add_middleware(RateLimit)
app.include_router(router)

db.init_db()



if __name__ == '__main__':
    for route in app.routes:
        if isinstance(route,APIRoute):
            print(f"{route.path}")
    uvicorn.run("app:app",host=os.getenv("localhost"),port=int(os.getenv("PORT")),reload=True)