from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from service.authService import create_user, generate_tokens,login_service
from schemas.schema import registerItem,loginItem
from service.authService import refresh_access_token
from loguru import logger
from exceptions.exception_handler import RegisterFailed , LoginFailed
def register_controller(data: registerItem,IP,USER_AGENT, db: Session):
    try:
        message = create_user(
            db,
            data.user_name,
            str(data.email),
            data.password.get_secret_value(),
            IP,
            USER_AGENT
        )
    except RegisterFailed as error:
        logger.error(
                        f"status_code: {status.HTTP_409_CONFLICT} |"
                        f"detail: {str(error)}"
                     )
        return {"message":str(error),"status":status.HTTP_409_CONFLICT} 
    logger.info(
                f"status_code: {status.HTTP_201_CREATED} |"
                f"message: {message}"
                )
    return {"message": message, "status": status.HTTP_201_CREATED}

def login_controller(data: loginItem,IP,USER_AGENT, db: Session):
    try:
        user = login_service(
            db,
            str(data.email),
            data.password.get_secret_value(),
            IP,
            USER_AGENT
        )
        tokens = generate_tokens(str(user.id))
        result_data={
            "message":"login successful",
            "access_token": str(tokens["access_token"]),
            "refresh_token": str(tokens["refresh_token"]),
            "token-type":"bearer",
            "status": status.HTTP_200_OK
        }
        response = JSONResponse(content=result_data)
        response.set_cookie(
            key="refresh_token",
            value=str(tokens["refresh_token"]),
            httponly=True,
            secure=False,
            samesite="strict",
            max_age=7*24*60*60,
            path="/"
        )
    except LoginFailed as error:
        logger.error(
            f"status_code: {status.HTTP_401_UNAUTHORIZED} |"
            f"detail: {str(error)}"
        )
        return {"message":str(error),"status":status.HTTP_401_UNAUTHORIZED}
    logger.info(
        f"status_code: {status.HTTP_200_OK} |"
        "message: Login successfull"
    )
    return response

def logout_controller():
    pass