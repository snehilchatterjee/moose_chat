from fastapi import FastAPI
from app.api.v1.user import router as user_router
from app.auth.oauth2 import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router, prefix="/api/v1/user", tags=["User"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])