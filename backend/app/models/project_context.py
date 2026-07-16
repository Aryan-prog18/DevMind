from pydantic import BaseModel


class ProjectContext(BaseModel):
    """Structured metadata extracted from a repository's source files."""

    repository_name: str
    framework: str
    languages: list[str]
    dependencies: list[str]
    package_manager: str | None
    important_files: list[str]
    project_structure: dict[str, list[str]]
    readme_summary: str
    architecture: str
    entry_points: list[str]
