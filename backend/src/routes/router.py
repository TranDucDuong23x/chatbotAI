from fastapi import APIRouter, Depends 
from controller.response_controller import response_controller, ask_question_controller
from controller.authController import login_controller, register_controller
from database import get_db
from schemas.schema import Item, loginItem, registerItem
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse, JSONResponse
import json
from fastapi import Request
from loguru import logger
router = APIRouter(
    prefix="/api",
    tags=["chatbotAI"]
)

@router.get("/event-stream")
def get_response():
    return response_controller()

@router.post("/ask")
def ask(Data: Item):
    ask_question_controller(Data)

@router.post("/login",tags=["Auth"],summary="Đăng nhập hệ thống")
def login(Data: loginItem,request:Request,next:str="/", db: Session = Depends(get_db)): 
    next = next.strip()
    if next.startswith("/") and not next.startswith(("//","/\\")):
        safe_url = next
    else:
        safe_url="/sign-in"
    IP=request.client.host
    USER_AGENT = request.headers.get("user-agent","Unknown")
    return login_controller(Data,IP,USER_AGENT,db), RedirectResponse(url=safe_url)

@router.post("/register", status_code=201, tags=["Auth"], summary="Đăng ký tài khoản")
def register(Data: registerItem,request: Request,next:str="/", db: Session = Depends(get_db)):
    next=next.strip()
    if next.startswith("/") and not next.startswith(("//","/\\")):
        safe_url=next
    else:
        safe_url="/sign-up"
    IP=request.client.host
    USER_AGENT = request.headers.get("user-agent","Unknown")
    response = register_controller(Data,IP,USER_AGENT, db)
    body = json.loads(response.body)
    body["redirect_url"] = safe_url
    jsonResponse=JSONResponse(content=body)
    content_length = jsonResponse.headers.get("content-length")
    jsonResponse.headers.update(response.headers)
    if content_length:
        jsonResponse.headers["content-length"] = content_length
    return jsonResponse
