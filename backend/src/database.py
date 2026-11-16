from sqlalchemy import create_engine
from pathlib import Path
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker, Mapped, mapped_column
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime
from sqlalchemy.sql import func
CURRENT_DIR = Path(__file__).resolve()

BASE_DIR = CURRENT_DIR.parents[0]

DIR= BASE_DIR / "datas" / "user_db.db"

DIR.parent.mkdir(parents=True,exist_ok=True)

DATABASE_URL = f"sqlite:///{DIR}"


engine=create_engine(DATABASE_URL,connect_args={"check_same_thread":False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    created_at: Mapped[datetime] = mapped_column(
        server_default = func.now(),
        nullable=False,
        comment="Ngày tạo bản ghi"
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default= func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Ngày cập nhật bản ghi"
    )

class AuditLog(DeclarativeBase):
    
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    timestamp: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False,
        comment="Ngày ghi log"
    )
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    AuditLog.metadata.create_all(bind=engine)