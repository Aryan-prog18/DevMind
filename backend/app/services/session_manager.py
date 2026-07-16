"""Thread-safe in-memory storage for analyzed project contexts."""

from threading import RLock
from uuid import uuid4

from app.models.project_context import ProjectContext

_sessions: dict[str, ProjectContext] = {}
_sessions_lock = RLock()


def create_session(context: ProjectContext) -> str:
    """Store a project context and return its new unique session identifier."""
    session_id = str(uuid4())
    with _sessions_lock:
        _sessions[session_id] = context.model_copy(deep=True)
    return session_id


def get_session(session_id: str) -> ProjectContext | None:
    """Return a copy of a stored project context, if the session exists."""
    with _sessions_lock:
        context = _sessions.get(session_id)
        return context.model_copy(deep=True) if context else None


def delete_session(session_id: str) -> bool:
    """Delete a project session and report whether it existed."""
    with _sessions_lock:
        return _sessions.pop(session_id, None) is not None
