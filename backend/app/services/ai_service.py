"""AI orchestration for context-grounded DevMind responses."""

import os

from dotenv import load_dotenv
from httpx import ConnectError, TimeoutException
from collections.abc import Iterator
from ollama import Client, ResponseError


from app.models.project_context import ProjectContext

DEFAULT_MODEL = "qwen2.5-coder:7b"

SYSTEM_PROMPT = """
You are DevMind, an expert software engineering assistant.

Always write clean, valid Markdown.

Rules:
- Use proper Markdown headings (#, ##, ###).
- Leave a blank line after every heading.
- Use short paragraphs.
- Use bullet lists where appropriate.
- Wrap filenames, functions, and class names in backticks.
- Never invent repository information.
- If information is unavailable, clearly say so.
- Avoid repeating information.

Your responses should be clean, well-spaced, and easy to scan, similar to ChatGPT.
"""
class AIServiceError(RuntimeError):
    """Raised when an AI response cannot be generated."""


def build_repository_prompt(
    context: ProjectContext,
    question: str,
) -> str:
    return f"""
You are DevMind, an expert software engineering assistant.

You have already analyzed this repository.

==========================
REPOSITORY
==========================

Repository Name:
{context.repository_name}

Framework:
{context.framework}

Languages:
{", ".join(context.languages)}

Package Manager:
{context.package_manager}

Architecture:
{context.architecture}

Entry Points:
{chr(10).join("- " + e for e in context.entry_points)}

Important Files:
{chr(10).join("- " + f for f in context.important_files)}

Dependencies:
{chr(10).join("- " + d for d in context.dependencies[:30])}

Project Structure:

{context.project_structure}

README Summary:

{context.readme_summary}

==========================
USER QUESTION
==========================

{question}

==========================
RULES
==========================

If the question is about the repository:

- ONLY answer using the repository information above.
- Never invent files.
- Never invent functions.
- Never invent classes.
- Mention filenames inside backticks.
- If information is unavailable, clearly say so.

Always format your answer like this:

# Title

Short introduction.

## Key Points

- point
- point
- point

## Explanation

Explain clearly.

## Related Files

- `file1`
- `file2`

## Summary

Short conclusion.

Keep answers concise, readable, and well formatted.
"""


def answer_repository_question(context: ProjectContext, question: str) -> str:
    """Generate a repository-aware answer through the local Ollama server."""
    load_dotenv()
    client = Client(host="http://localhost:11434")

    try:
        response = client.chat(
    model=os.getenv("OLLAMA_MODEL", DEFAULT_MODEL),
    messages=[
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": build_repository_prompt(
                context,
                question,
            ),
        },
    ],
)
    except (ConnectError, TimeoutException) as error:
        raise AIServiceError(
            "Ollama is unavailable. Start the local Ollama server at http://localhost:11434."
        ) from error
    except ResponseError as error:
        raise AIServiceError(f"Ollama could not generate a response: {error.error}") from error

    answer = response.message.content.strip()
    if not answer:
        raise AIServiceError("Ollama returned an empty assistant response.")
    return answer

def stream_repository_answer(
    context: ProjectContext,
    question: str,
) -> Iterator[str]:
    """Stream a repository-aware answer from Ollama."""

    load_dotenv()

    client = Client(host="http://localhost:11434")

    try:
        stream = client.chat(
            model=os.getenv("OLLAMA_MODEL", DEFAULT_MODEL),
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": build_repository_prompt(
                        context,
                        question,
                    ),
                }
            ],
            stream=True,
        )

        buffer = ""

        for chunk in stream:
            if chunk.message.content:
                buffer += chunk.message.content

        while "\n" in buffer:
            line, buffer = buffer.split("\n", 1)
            yield line + "\n"

        if buffer:
            yield buffer

    except (ConnectError, TimeoutException) as error:
        raise AIServiceError(
            "Ollama is unavailable. Start the local Ollama server."
        ) from error

    except ResponseError as error:
        raise AIServiceError(
            f"Ollama could not generate a response: {error.error}"
        ) from error
