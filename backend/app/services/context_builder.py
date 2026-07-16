"""Build reusable project context from an analyzed repository checkout."""

from __future__ import annotations

import json
from pathlib import Path
import re

from git import InvalidGitRepositoryError, NoSuchPathError, Repo

from app.models.project_context import ProjectContext
from app.services.parser_service import (
    detect_framework,
    detect_languages,
    extract_dependencies,
    list_repository_files,
)

CONTEXT_FILE_NAMES = (
    "README.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "Cargo.toml",
    "cargo.toml",
    "go.mod",
    "tsconfig.json",
    "vite.config.ts",
    "Dockerfile",
    "docker-compose.yml",
)
ENTRY_POINT_CANDIDATES = (
    "src/main.tsx",
    "src/main.ts",
    "src/index.tsx",
    "src/index.ts",
    "src/index.js",
    "src/main.py",
    "app/main.py",
    "main.py",
    "manage.py",
    "server.js",
    "index.js",
    "main.go",
    "src/main.rs",
)
IGNORED_DIRECTORIES = {".git", "node_modules", ".venv", "venv", "dist", "build", "target"}


def build_project_context(repository_path: Path) -> ProjectContext:
    """Extract a serializable project context from a repository directory."""
    repository_path = Path(repository_path)
    if not repository_path.is_dir():
        raise ValueError(f"Repository path does not exist or is not a directory: {repository_path}")

    files = list_repository_files(repository_path)
    dependencies = extract_dependencies(repository_path)
    framework = detect_framework(repository_path, dependencies)

    return ProjectContext(
        repository_name=detect_repository_name(repository_path),
        framework=framework,
        languages=detect_languages(files),
        dependencies=dependencies,
        package_manager=detect_package_manager(repository_path),
        important_files=find_important_files(repository_path),
        project_structure=build_project_structure(repository_path),
        readme_summary=extract_readme_summary(repository_path),
        architecture=describe_architecture(repository_path, framework),
        entry_points=find_entry_points(repository_path),
    )


def build_project_context_json(repository_path: Path) -> dict[str, object]:
    """Build the project context as JSON-compatible data for API responses."""
    return build_project_context(repository_path).model_dump(mode="json")


def detect_repository_name(repository_path: Path) -> str:
    """Prefer the Git origin name so temporary clone folders do not leak into context."""
    try:
        origin_url = Repo(repository_path).remotes.origin.url
        repository_name = origin_url.rstrip("/").split("/")[-1].removesuffix(".git")
        if repository_name:
            return repository_name
    except (AttributeError, InvalidGitRepositoryError, NoSuchPathError):
        pass
    return repository_path.name


def find_important_files(repository_path: Path) -> list[str]:
    """Return the supported configuration and documentation files that exist."""
    return [file_name for file_name in CONTEXT_FILE_NAMES if (repository_path / file_name).is_file()]


def detect_package_manager(repository_path: Path) -> str | None:
    """Infer the primary package manager from manifests and lock files."""
    if (repository_path / "package.json").is_file():
        if (repository_path / "pnpm-lock.yaml").is_file():
            return "pnpm"
        if (repository_path / "yarn.lock").is_file():
            return "yarn"
        if (repository_path / "bun.lockb").is_file() or (repository_path / "bun.lock").is_file():
            return "bun"
        return "npm"
    if (repository_path / "Cargo.toml").is_file() or (repository_path / "cargo.toml").is_file():
        return "cargo"
    if (repository_path / "go.mod").is_file():
        return "go modules"
    if (repository_path / "pyproject.toml").is_file():
        return "poetry" if (repository_path / "poetry.lock").is_file() else "pip"
    if (repository_path / "requirements.txt").is_file():
        return "pip"
    return None


def build_project_structure(repository_path: Path) -> dict[str, list[str]]:
    """Create a compact, shallow directory map of the project."""
    structure: dict[str, list[str]] = {}
    root_entries: list[str] = []

    for path in sorted(repository_path.iterdir(), key=lambda item: item.name.lower()):
        if path.name in IGNORED_DIRECTORIES:
            continue
        if path.is_file():
            root_entries.append(path.name)
            continue
        if path.is_dir():
            children = [child.name for child in sorted(path.iterdir(), key=lambda item: item.name.lower()) if child.name not in IGNORED_DIRECTORIES]
            structure[path.name] = children[:50]

    structure["."] = root_entries[:50]
    return structure


def extract_readme_summary(repository_path: Path) -> str:
    """Read the first useful README content as a concise plain-text summary."""
    readme_path = repository_path / "README.md"
    try:
        readme = readme_path.read_text(encoding="utf-8")
    except (FileNotFoundError, OSError, UnicodeDecodeError):
        return "No README summary available."

    lines: list[str] = []
    for line in readme.splitlines():
        cleaned = re.sub(r"^#{1,6}\s+", "", line).strip()
        if cleaned and not cleaned.startswith(("```", "![", "[!")):
            lines.append(cleaned)
        if len(" ".join(lines)) >= 500:
            break

    summary = " ".join(lines)
    return summary[:500].strip() or "No README summary available."


def describe_architecture(repository_path: Path, framework: str) -> str:
    """Infer a lightweight architecture description from known project files."""
    parts = [f"{framework} application" if framework != "Unknown" else "application"]
    source_directories = [name for name in ("src", "app", "api", "backend", "frontend") if (repository_path / name).is_dir()]

    if source_directories:
        parts.append(f"source directories: {', '.join(source_directories)}")
    if (repository_path / "docker-compose.yml").is_file():
        parts.append("multi-service Docker Compose setup")
    elif (repository_path / "Dockerfile").is_file():
        parts.append("containerized with Docker")

    return "; ".join(parts) + "."


def find_entry_points(repository_path: Path) -> list[str]:
    """Identify likely runtime entry points from common conventions and npm scripts."""
    entry_points = [candidate for candidate in ENTRY_POINT_CANDIDATES if (repository_path / candidate).is_file()]
    entry_points.extend(_package_script_entry_points(repository_path / "package.json"))
    return sorted(set(entry_points))


def _package_script_entry_points(package_path: Path) -> list[str]:
    try:
        package = json.loads(package_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, UnicodeDecodeError, json.JSONDecodeError):
        return []

    scripts = package.get("scripts", {})
    if not isinstance(scripts, dict):
        return []
    return [f"npm run {name}" for name in ("dev", "start", "serve") if name in scripts]
