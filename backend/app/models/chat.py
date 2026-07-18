from pydantic import BaseModel, Field


class RepositoryChatRequest(BaseModel):
    session_id: str = Field(..., description="Repository session ID")
    question: str = Field(..., min_length=1)


class RepositoryChatResponse(BaseModel):
    answer: str
    repository_name: str