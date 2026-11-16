from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request , status
import time
from hashlib import md5
from fastapi.responses import JSONResponse
from loguru import logger
class RateLimit(BaseHTTPMiddleware):
    def __init__(self,app,capacity: int = 10,rate: float = 10/60,high_trafic_limit: int = 50):
        super().__init__(app)
        self.capacity = capacity
        self.rate = rate
        self.high_trafic_limit = high_trafic_limit
        self.bucket = {}
        self.request_active = 0
    async def dispatch (self,request:Request,call_next):
        self.request_active += 1
        try:
            now = time.monotonic()
            ip= request.client.host if request.client else "Unknown"
            user_agent = request.headers.get("user-agent","Unknown")
            raw_key = f"{ip}:{user_agent}".encode('utf-8')
            client_key= md5(raw_key).hexdigest()
            if len(self.bucket) > 10000:
                self.bucket.clear()
            tokens, last_time = self.bucket.get(client_key,(self.capacity,now))
            tokens = min(self.capacity,tokens + (now - last_time)*self.rate)  
            is_trafic_high = True if self.request_active > self.high_trafic_limit else False
            tokens_cost = 3 if is_trafic_high else 1
            if tokens < tokens_cost:
                retry_after = int((tokens_cost - tokens)/self.rate)+1
                reason = "Hệ thống đang có lưu lượng truy cập cao. Vui lòng thử lại sau." if is_trafic_high else "Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau."
                logger.warning(f"{status.HTTP_429_TOO_MANY_REQUESTS} Block | IP: {ip} | Path: {request.url.path} | Reason: {reason}")
                return JSONResponse(
                    status_code= status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={"Retry-after": str(retry_after)},
                    content={
                        "message":reason
                    }
                )
            self.bucket[client_key]=(tokens-tokens_cost,now)
            return await call_next(request)
        finally:
            self.request_active -= 1