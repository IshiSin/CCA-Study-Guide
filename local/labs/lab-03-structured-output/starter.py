"""
Lab 03: Structured Output with Pydantic
========================================
Learning objective: Implement a validation + retry loop so that Claude's JSON
output is always parsed into a typed Pydantic model.

Why bother with Pydantic? The model occasionally:
  - Returns text before/after the JSON block
  - Omits required fields
  - Uses an unexpected type (e.g., score as a string instead of int)

A retry loop with error feedback in the prompt dramatically reduces failure rates.

Your task: Complete the `extract_review` function by adding validation and retry.
"""

import json
import anthropic
from pydantic import BaseModel, ValidationError
from typing import Literal

client = anthropic.Anthropic()


class ProductReview(BaseModel):
    """Structured representation of a product review."""
    sentiment: Literal["positive", "neutral", "negative"]
    score: int          # 1–5 stars
    summary: str        # One-sentence summary
    key_points: list[str]  # 2–4 bullet points


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
    Extract structured review data from raw review text.

    Steps:
      1. Call Claude with the review text.
      2. Parse the response as JSON.
      3. Validate with Pydantic.
      4. If parsing or validation fails, retry with error feedback.
      5. After max_retries, raise the last exception.

    TODO: Add the retry loop. The current implementation makes one attempt
    but does not retry on failure.
    """
    # This is the base user message — you may want to modify it during retries
    # to include the previous error so Claude can self-correct.
    messages = [
        {"role": "user", "content": f"Analyze this product review:\n\n{text}"}
    ]

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    # TODO: Wrap the following in a retry loop (for attempt in range(max_retries)).
    #       On failure, append the assistant response and a corrective user message,
    #       then call the API again.

    data = json.loads(response.content[0].text)
    return ProductReview(**data)


if __name__ == "__main__":
    review_text = (
        "This laptop is absolutely fantastic! The battery lasts all day, "
        "the keyboard is a pleasure to type on, and the display is gorgeous. "
        "Highly recommend to anyone looking for a premium experience."
    )
    result = extract_review(review_text)
    print(result.model_dump_json(indent=2))
