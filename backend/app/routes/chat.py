from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.models.chat import RepositoryChatRequest, RepositoryChatResponse
from app.services.ai_service import (
    AIServiceError,
    answer_repository_question,
    stream_repository_answer,
)
from app.services.session_manager import get_session

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/repository", response_model=RepositoryChatResponse)
def chat_with_repository(
    request: RepositoryChatRequest,
) -> RepositoryChatResponse:
    """Answer a question using an already analyzed repository session."""

    context = get_session(request.session_id)

    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository session not found. Please analyze the repository again.",
        )

    try:
        answer = answer_repository_question(
            context=context,
            question=request.question,
        )

        return RepositoryChatResponse(
            answer=answer,
            repository_name=context.repository_name,
        )

    except AIServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

@router.post("/repository/stream")
def stream_chat_with_repository(
    request: RepositoryChatRequest,
):
    """Stream an AI response for an analyzed repository."""

    context = get_session(request.session_id)

    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository session not found. Please analyze the repository again.",
        )

    try:

        def event_stream():
            for chunk in stream_repository_answer(
                context=context,
                question=request.question,
            ):
                print(repr(chunk))
                yield f"data: {chunk}\n\n"

            yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
        )

    except AIServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error