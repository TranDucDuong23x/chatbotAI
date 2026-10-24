from service.response_service import get_ai_stream , ask_question
from fastapi.responses import StreamingResponse
def response_controller():
    return StreamingResponse(
        get_ai_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-control":"no-cache",
            "Connection":"keep-alive"
        }
    )
def ask_question_controller(text_origin:str):
    ask_question(text_origin)