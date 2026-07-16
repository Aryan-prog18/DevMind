from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Return the service health status."""
    return {
        "status": "healthy",
        "service": "DevMind API",
        "version": "0.1",
    }
