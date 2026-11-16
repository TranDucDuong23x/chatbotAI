from fastapi import Response
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger
import time
class SecurityHeader(BaseHTTPMiddleware):
   async def dispatch(self,request,call_next):
       starttime = time.time()
       response: Response = await call_next(request)
       response.headers["X-Content-Type-Options"]="nosniff"
       response.headers["X-Frame-Options"] ="Deny"
       response.headers["Referrer-Policy"]="strict-origin-when-cross-origin"
       response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
       process_time = (time.time() - starttime)*1000
       logger.info(
           f"IP: {request.client.host} |"
           f"Method: {request.method} |"
           f"Path: {request.url.path} |"
           f"Status: {response.status_code} |"
           f"process_time: {process_time: .2f}ms"
       )
       return response