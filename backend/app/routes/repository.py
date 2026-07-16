from fastapi import APIRouter, HTTPException, status

from app.models.repository import RepositoryAnalyzeRequest, RepositoryAnalyzeResponse
from app.services.github_service import GitHubRepositoryError, clone_repository, repository_name_from_url
from app.services.context_builder import build_project_context
from app.services.parser_service import analyze_repository
from app.services.session_manager import create_session

router = APIRouter(prefix="/api/repository", tags=["repository"])


@router.post("/analyze", response_model=RepositoryAnalyzeResponse)
async def analyze_github_repository(
    request: RepositoryAnalyzeRequest,
) -> RepositoryAnalyzeResponse:
    """Clone a public GitHub repository and return a lightweight codebase profile."""
    try:
        with clone_repository(request.repo_url) as repository_path:
            analysis = analyze_repository(
                repository_path,
                repository_name=repository_name_from_url(request.repo_url),
            )
            context = build_project_context(repository_path)
            session_id = create_session(context)
            return RepositoryAnalyzeResponse(session_id=session_id, **analysis)
    except GitHubRepositoryError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
