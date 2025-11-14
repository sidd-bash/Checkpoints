from fastapi import FastAPI
from fastapi.openapi.models import APIKey, APIKeyIn, SecuritySchemeType
from fastapi.openapi.utils import get_openapi
from src.routes import auth_routes
from src.middlewares.auth_middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],  # important: allows OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)

# ✅ Add the authentication middleware
app.add_middleware(AuthMiddleware)

# ✅ Include your routes
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])


# ✅ Custom OpenAPI schema (so /docs shows “Authorize”)
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Your API",
        version="1.0.0",
        description="API documentation with JWT bearer support",
        routes=app.routes,
    )

    # ✅ FIXED: Use plain strings instead of Enum
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",          # was SecuritySchemeType.http ❌
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # ✅ Optional: apply security globally
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi