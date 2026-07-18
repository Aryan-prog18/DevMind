from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, health, upload, repository

app = FastAPI(title="DevMind API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dev-mind-lxfxce4ru-devmind1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """Return basic API metadata."""
    return {"message": "DevMind API"}


app.include_router(health.router)
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(repository.router)