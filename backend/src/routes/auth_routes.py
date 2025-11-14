from fastapi import APIRouter, status
from src.controllers import auth_controller
import src.models.user_model as user_models
from fastapi.responses import JSONResponse
from fastapi import Depends, Security  # CHANGED: Keep Security if needed, but update dependency
from fastapi import Request
import logging
logger = logging.getLogger(__name__)


router = APIRouter()
  # CHANGED: Import Request to access request.state
@router.post("/signup")
async def signup_route(user: user_models.UserCreate):
    logger.info("Signup route called")
    result = await auth_controller.signup(user)
    return JSONResponse(
        status_code=result.get("status", status.HTTP_200_OK),
        content=result
    )

@router.post("/login")
async def login_route(user: user_models.UserLogin):
    logger.info("Login route called with user: %s", user.email)
    return await auth_controller.login(user)

# CHANGED: Use the updated get_current_user directly (no need for oauth2_scheme)
@router.get("/me")
async def get_me(request: Request):
    user = request.state.user
    logger.info("Get me route called for user: %s", user.email if user else "Anonymous")
    return {"user": user}