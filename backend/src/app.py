from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.routes.router import router
from fastapi.routing import APIRoute
import uvicorn
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router)

if __name__ == '__main__':
    for route in app.routes:
        if isinstance(route,APIRoute):
            print(f"{route.path}")
    uvicorn.run("app:app",host="127.0.0.1",port=5000,reload=True)