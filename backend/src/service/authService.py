from models.user import User
from models.auditLog import Audit_logs
from sqlalchemy.orm import Session
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from uuid import uuid4
import jwt
from datetime import datetime, timedelta, timezone
from config.jwt import get_config
from uuid6 import uuid7
from fastapi import Response
password_hashing=PasswordHasher(
    time_cost=3,
    memory_cost=64*1024,
    parallelism=1,
    salt_len=16,
    hash_len=32
)
def create_user(db:Session,username: str, email: str, password: str,IP,USER_AGENT):
    if db.query(User).filter(User.email == email).first():
        raise ValueError("Email already exists")
    hashed_password = password_hashing.hash(password)
    new_user = User(
        id=str(uuid4()),
        username=username,
        email=email,
        password=hashed_password,
    )
    log="User created successfully"
    new_log=Audit_logs(
        id=str(uuid7()),
        user_id = new_user.id,
        ip_address = IP,
        user_agent = USER_AGENT,
        action=log,
        status = 201
    )
    db.add_all([new_user,new_log])
    db.commit()
    db.refresh(new_user)
    return "User created successfully"

def login_service(db:Session, email:str,password:str,IP,USER_AGENT):
    user = db.query(User).filter(User.email == email).first()
    new_log = Audit_logs(
        id = str(uuid7()),
        user_id=user.id,
        ip_address = IP,
        user_agent = USER_AGENT,
        action = "Login successfully",
        status=200
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    if user is None:
        raise ValueError("Email not matched")
    try:
        password_hashing.verify(user.password, password)
    except VerifyMismatchError:
        raise ValueError("Password not matched")
    return user

def refresh_token(user_id:str) -> str:
    expired_time = datetime.now(timezone.utc) + timedelta(days = 7)
    payload = {
        "sub":user_id,
        "exp":expired_time,
        "type":"refresh"
    }
    
    return jwt.encode(payload,get_config().jwt_secret_key.get_secret_value(),get_config().algorithm)
def access_token(user_id:str) -> str:
    expire_time = datetime.now(timezone.utc) + timedelta(minutes = 30)
    payload = {
        "sub": user_id,
        "exp": expire_time,
        "type": "access"
    } 
    return jwt.encode(payload,get_config().jwt_secret_key.get_secret_value(),get_config().algorithm)

def generate_tokens(user_id: str) -> dict:
    access_token_str = access_token(user_id)
    refresh_token_str = refresh_token(user_id)
    return {
        "access_token": access_token_str,
        "refresh_token": refresh_token_str
    }

def refresh_access_token(refresh_token: str):
    try:
        payload = jwt.decode(
            refresh_token,
            get_config().jwt_secret_key.get_secret_value(),
            algorithms=[get_config().algorithm]
        )
        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Can not find user id in token")
        return generate_tokens(user_id)  
    except jwt.ExpiredSignatureError:
        raise ValueError("Refresh token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid refresh token")
    except jwt.InvalidAlgorithmError:
        raise ValueError("Invalid algorithm used in token")

def _logout(response:Response,tokens:dict):
    response.delete_cookie(key="refresh_token",
                value=str(tokens["refresh_token"]),
                httponly=True,
                secure=False,
                samesite="strict",
                max_age=7*24*60*60,
                path="/"
    )
    