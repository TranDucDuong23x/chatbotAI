from pydantic import BaseModel, EmailStr, SecretStr, Field, field_validator, model_validator, StringConstraints
import re
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Annotated

NonEmptyText = Annotated[str,StringConstraints(strip_whitespace=True,min_length=1)]

class Item(BaseModel):
    text_origin:NonEmptyText= Field(...,description="user's input")

class loginItem(BaseModel):
    email:EmailStr = Field(..., description="User's email address")
    password:SecretStr = Field(...,min_length=8,max_length=30, description="User's password")

class registerItem(loginItem):
    user_name:NonEmptyText = Field(...,min_length=3,max_length=128,pattern=r"^[A-Za-z0-9]+$")
    confirm_password:SecretStr = Field(...,min_length=8,max_length=30, description="Confirm user's password")
    @field_validator("password")
    @classmethod
    def password_validator(cls, value: SecretStr) -> SecretStr:
        password= value.get_secret_value()
        pattern = r"^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%*#?&])[A-Za-z0-9@$!%*#?&]{8,}$"
        if not re.match(pattern,password):
            raise ValueError("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.")
        return value
    @model_validator(mode="after")
    def password_match(self):
        if self.password.get_secret_value() != self.confirm_password.get_secret_value():
            raise ValueError("Password and confirm password do not match")
        return self
    
class TokenSchema(BaseSettings):
    jwt_secret_key: SecretStr = Field(..., description="JWT secret key")
    algorithm: str = "HS256"
    model_config = SettingsConfigDict(env_file=".env",env_file_encoding="utf-8",extra="ignore")