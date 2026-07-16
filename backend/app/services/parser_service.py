"""Helpers for extracting lightweight metadata from a source repository."""

from __future__ import annotations

import json
from pathlib import Path
import tomllib

from git import InvalidGitRepositoryError, NoSuchPathError, Repo

MAX_FILES = 250
IGNORED_DIRECTORIES = {".git", "node_modules", ".venv", "venv", "dist", "build", "target"}
LANGUAGE_EXTENSIONS = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".java": "Java",
    ".kt": "Kotlin",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".rb": "Ruby",
    ".cs": "C#",
    ".c": "C",
    ".h": "C",
    ".cpp": "C++",
    ".hpp": "C++",
    ".vue": "Vue",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sql": "SQL",
}


def analyze_repository(
    repository_path: Path, repository_name: str | None = None
) -> dict[str, str | list[str]]:
    """Build a concise repository profile from its files and manifests."""
    files = list_repository_files(repository_path)
    dependencies = extract_dependencies(repository_path)
    languages = detect_languages(files)
    framework = detect_framework(repository_path, dependencies)
    name = repository_name or repository_path.name
    default_branch = get_default_branch(repository_path)

    return {
        "name": name,
        "framework": framework,
        "languages": languages,
        "dependencies": dependencies,
        "files": files,
        "summary": build_summary(name, framework, languages, default_branch),
    }


def list_repository_files(repository_path: Path) -> list[str]:
    """List source files, excluding generated and Git metadata directories."""
    files: list[str] = []
    for path in sorted(repository_path.rglob("*")):
        if any(part in IGNORED_DIRECTORIES for part in path.relative_to(repository_path).parts):
            continue
        if path.is_file():
            files.append(path.relative_to(repository_path).as_posix())
        if len(files) >= MAX_FILES:
            break
    return files


def detect_languages(files: list[str]) -> list[str]:
    """Infer languages from file extensions."""
    return sorted({LANGUAGE_EXTENSIONS.get(Path(file_name).suffix.lower(), "") for file_name in files} - {""})


def extract_dependencies(repository_path: Path) -> list[str]:
    """Extract dependency names from supported package manifests."""
    dependencies: set[str] = set()
    dependencies.update(_package_json_dependencies(repository_path / "package.json"))
    dependencies.update(_requirements_dependencies(repository_path / "requirements.txt"))
    dependencies.update(_toml_dependencies(repository_path / "pyproject.toml", "python"))
    cargo_manifest = repository_path / "Cargo.toml"
    dependencies.update(_toml_dependencies(cargo_manifest, "cargo"))
    if not cargo_manifest.exists():
        dependencies.update(_toml_dependencies(repository_path / "cargo.toml", "cargo"))
    dependencies.update(_go_mod_dependencies(repository_path / "go.mod"))
    return sorted(dependencies, key=str.lower)


def detect_framework(repository_path: Path, dependencies: list[str]) -> str:
    """Detect a supported framework from dependencies and common config files."""
    dependency_names = {dependency.lower().replace("_", "-") for dependency in dependencies}
    framework_dependencies = (
        ("Next.js", {"next"}),
        ("React", {"react", "react-dom"}),
        ("Vue", {"vue", "nuxt"}),
        ("Angular", {"@angular/core"}),
        ("FastAPI", {"fastapi"}),
        ("Flask", {"flask"}),
        ("Django", {"django"}),
        ("Express", {"express"}),
    )
    for framework, markers in framework_dependencies:
        if dependency_names.intersection(markers):
            return framework

    if (repository_path / "composer.json").is_file():
        try:
            composer = json.loads((repository_path / "composer.json").read_text(encoding="utf-8"))
            if "laravel/framework" in composer.get("require", {}):
                return "Laravel"
        except (json.JSONDecodeError, OSError):
            pass

    if _contains_spring_dependency(repository_path):
        return "Spring"
    return "Unknown"


def get_default_branch(repository_path: Path) -> str | None:
    """Return the cloned repository's default branch when Git metadata is available."""
    try:
        repository = Repo(repository_path)
        return repository.active_branch.name
    except (InvalidGitRepositoryError, NoSuchPathError, TypeError):
        return None


def build_summary(
    name: str, framework: str, languages: list[str], default_branch: str | None
) -> str:
    """Create a human-readable analysis summary."""
    language_description = ", ".join(languages) if languages else "no recognized languages"
    framework_description = framework if framework != "Unknown" else "no recognized framework"
    branch_description = f" Its default branch is {default_branch}." if default_branch else ""
    return f"{name} uses {language_description} with {framework_description}.{branch_description}"


def _package_json_dependencies(path: Path) -> set[str]:
    try:
        package = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, json.JSONDecodeError):
        return set()

    sections = ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies")
    return {name for section in sections for name in package.get(section, {}).keys()}


def _requirements_dependencies(path: Path) -> set[str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (FileNotFoundError, OSError):
        return set()

    dependencies = set()
    for line in lines:
        requirement = line.split("#", maxsplit=1)[0].strip()
        if requirement and not requirement.startswith(("-", "http://", "https://")):
            dependencies.add(requirement.split("[", maxsplit=1)[0].split("=", maxsplit=1)[0].split(">", maxsplit=1)[0].split("<", maxsplit=1)[0].strip())
    return dependencies


def _toml_dependencies(path: Path, manifest_type: str) -> set[str]:
    try:
        manifest = tomllib.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, tomllib.TOMLDecodeError):
        return set()

    if manifest_type == "python":
        project_dependencies = manifest.get("project", {}).get("dependencies", [])
        poetry_dependencies = manifest.get("tool", {}).get("poetry", {}).get("dependencies", {}).keys()
        return {item.split("[", maxsplit=1)[0].split("=", maxsplit=1)[0].split(">", maxsplit=1)[0].split("<", maxsplit=1)[0].strip() for item in [*project_dependencies, *poetry_dependencies] if item != "python"}

    return set(manifest.get("dependencies", {}).keys())


def _go_mod_dependencies(path: Path) -> set[str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (FileNotFoundError, OSError):
        return set()

    dependencies = set()
    in_require_block = False
    for line in lines:
        stripped = line.strip()
        if stripped == "require (":
            in_require_block = True
            continue
        if in_require_block and stripped == ")":
            in_require_block = False
            continue
        if stripped.startswith("require "):
            dependencies.add(stripped.removeprefix("require ").split()[0])
        elif in_require_block and stripped and not stripped.startswith("//"):
            dependencies.add(stripped.split()[0])
    return dependencies


def _contains_spring_dependency(repository_path: Path) -> bool:
    for file_name in ("pom.xml", "build.gradle", "build.gradle.kts"):
        path = repository_path / file_name
        try:
            if "spring" in path.read_text(encoding="utf-8").lower():
                return True
        except (FileNotFoundError, OSError):
            continue
    return False
