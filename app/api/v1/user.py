from fastapi import FastAPI, Depends, HTTPException
from fastapi.routing import APIRouter

router = APIRouter()

@router.get("/users")
def get_users():
    return [{"id": 1, "name": "John Doe"}, {"id": 2, "name": "Jane Doe"}]