"""Helpers for validating and cloning public GitHub repositories."""

from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlparse
import re

from git import GitCommandError, Repo

GITHUB_NAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*$")


class GitHubRepositoryError(ValueError):
    """Raised when a GitHub repository cannot be validated or cloned."""


def validate_github_url(repo_url: str) -> str:
    """Validate and normalize a canonical public GitHub repository URL."""
    parsed = urlparse(repo_url.strip())
    path_parts = [part for part in parsed.path.split("/") if part]

    if (
        parsed.scheme != "https"
        or parsed.netloc.lower() != "github.com"
        or parsed.params
        or parsed.query
        or parsed.fragment
        or len(path_parts) != 2
    ):
        raise GitHubRepositoryError(
            "repo_url must be an HTTPS GitHub repository URL, for example "
            "https://github.com/owner/repository."
        )

    owner, repository = path_parts
    repository = repository.removesuffix(".git")
    if not owner or not repository or not all(
        GITHUB_NAME_PATTERN.fullmatch(value) for value in (owner, repository)
    ):
        raise GitHubRepositoryError("repo_url contains an invalid GitHub owner or repository name.")

    return f"https://github.com/{owner}/{repository}.git"


def repository_name_from_url(repo_url: str) -> str:
    """Return the repository name from a previously accepted GitHub URL."""
    clone_url = validate_github_url(repo_url)
    return Path(urlparse(clone_url).path).stem


@contextmanager
def clone_repository(repo_url: str) -> Iterator[Path]:
    """Clone a repository into an automatically cleaned-up temporary directory."""
    clone_url = validate_github_url(repo_url)

    with TemporaryDirectory(prefix="devmind-repository-") as temporary_directory:
        repository_path = Path(temporary_directory) / "repository"
        try:
            Repo.clone_from(clone_url, repository_path, depth=1)
        except GitCommandError as error:
            raise GitHubRepositoryError(
                "Unable to clone this repository. Confirm that it exists and is publicly accessible."
            ) from error

        yield repository_path
