from fastapi import APIRouter
from controller.response_controller import response_controller, ask_question_controller
from pydantic import BaseModel
router = APIRouter(
    prefix="/api",
    tags=["chatbotAI"]
)

@router.get("/event-stream")
def get_response():
    return response_controller()

class Item(BaseModel):
    text_origin:str


@router.post("/ask")
def ask(data: Item):
    text_origin = data.text_origin
    ask_question_controller(text_origin)
    
