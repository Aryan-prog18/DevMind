from pydantic import BaseModel, Field


class RepositoryAnalyzeRequest(BaseModel):
    repo_url: str = Field(..., description="Public GitHub repository URL")


class RepositoryAnalyzeResponse(BaseModel):
    session_id: str
    name: str
    framework: str
    languages: list[str]
    dependencies: list[str]
    files: list[str]
    summary: str
