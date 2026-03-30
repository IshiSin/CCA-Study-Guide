"""
Lab 03: Structured Output with Pydantic — SOLUTION
====================================================
The retry loop builds a conversation: send the invalid response back to Claude
along with an explanation of what went wrong, so it can self-correct.
"""

import json
import anthropic
from pydantic import BaseModel, ValidationError
from typing import Literal

client = anthropic.Anthropic()


class ProductReview(BaseModel):
    """Structured representation of a product review."""
    sentiment: Literal["positive", "neutral", "negative"]
    score: int
    summary: str
    key_points: list[str]


SYSTEM_PROMPT = """You are a review analysis assistant.
When asked to analyze a review, respond ONLY with a valid JSON object.
Do not include any text before or after the JSON.

The JSON must have these exact fields:
- sentiment: "positive", "neutral", or "negative"
- score: integer from 1 to 5
- summary: one-sentence summary string
- key_points: list of 2-4 strings
"""


def extract_review(text: str, max_retries: int = 3) -> ProductReview:
    """
    Extract structured review data, retrying on parse or validation errors.

    Retry strategy: on failure, append the bad response and an error message
    to the conversation so Claude can see exactly what went wrong and fix it.
    This is more effective than just repeating the same prompt.
    """
    messages: list[dict] = [
        {"role": "user", "content": f"Analyze this product review:\n\n{text}"}
    ]

    last_exception: Exception = RuntimeError("No attempts made")

    for attempt in range(max_retries):
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        raw_text = response.content[0].text

        try:
            data = json.loads(raw_text)
            # Pydantic validates types and allowed values (e.g., score in 1-5)
            return ProductReview(**data)

        except (json.JSONDecodeError, ValidationError) as e:
            last_exception = e

            # On the last attempt, give up and surface the error
            if attempt == max_retries - 1:
                raise

            # Build a corrective follow-up: show Claude what it returned and
            # what was wrong, so it can produce a better response next time.
            error_description = str(e)
            correction_prompt = (
                f"Your previous response was:\n{raw_text}\n\n"
                f"That response failed validation with this error:\n{error_description}\n\n"
                "Please return ONLY a valid JSON object with the required fields. "
                "No extra text before or after."
            )

            # Append the assistant's bad response and the corrective user turn
            # so the conversation history shows the mistake and the fix request.
            messages.append({"role": "assistant", "content": raw_text})
            messages.append({"role": "user", "content": correction_prompt})

    # This line is unreachable but satisfies type checkers
    raise last_exception


if __name__ == "__main__":
    review_text = (
        "This laptop is absolutely fantastic! The battery lasts all day, "
        "the keyboard is a pleasure to type on, and the display is gorgeous. "
        "Highly recommend to anyone looking for a premium experience."
    )
    result = extract_review(review_text)
    print(result.model_dump_json(indent=2))
