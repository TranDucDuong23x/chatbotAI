from fastapi import APIRouter
from controller.response_controller import response_controller
router = APIRouter(
    prefix="/chatbotAI",
    tags=["chatbotAI"]
)

router.get("/get_response")
def get_response():
    return response_controller()