from sqlalchemy import Column, Integer, String, ForeignKey , CheckConstraint
from database import Base
class Audit_logs(Base):
    id = Column(String(50),primary_key=True,nullable=False, index=True)
    user_id = Column(String(50),ForeignKey("user.id", ondelete="CASCADE"),nullable=False,index=True)
    ip_address = Column(String(255),nullable=False)
    user_agent = Column(String(255),nullable=False)
    action = Column(String(255),nullable=False)
    status = Column(Integer,nullable=False)
    __table_args__=(
        CheckConstraint("(status >= 200 and status <= 207) or (status >= 300 and status <=308) or (status >= 400 and status <= 451)", name="business_status"),
    )