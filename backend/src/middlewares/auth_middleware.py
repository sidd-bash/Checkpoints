from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from src.utils.auth_utils import verify_token
from src.database import db
from bson import ObjectId

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # ✅ Define public (unprotected) routes
        public_routes = ["/auth/login", "/auth/signup", "/docs", "/openapi.json"]

        # ✅ Skip token check for public routes
        if any(request.url.path.startswith(route) for route in public_routes):
            return await call_next(request)

        # ✅ Get Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Authorization header missing or invalid"},
            )

        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        if payload is None:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )

        user_id = payload.get("sub")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"detail": "Token missing user ID"},
            )

        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return JSONResponse(
                status_code=404,
                content={"detail": "User not found"},
            )

        # ✅ Attach the user to request.state
        user["_id"] = str(user["_id"])
        user.pop("hashed_password", None)
        request.state.user = user

        # ✅ Proceed with the request
        response = await call_next(request)
        return response