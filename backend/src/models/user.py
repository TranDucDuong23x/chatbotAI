from sqlalchemy import Column, Integer, String
from database import Base
class User(Base):
    id = Column(String(36), primary_key=True,nullable=False, index=True)
    username = Column(String(128), nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    password = Column(String(255), nullable=False)