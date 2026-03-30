"""
Lab 07: Context Summarization — SOLUTION
==========================================
Rolling summarization: when the message list grows beyond max_messages, the
older portion is summarized via a cheap model call. The summary is stored
separately and prepended to every subsequent API call via the system prompt.
"""

import anthropic

client = anthropic.Anthropic()


class ConversationManager:
    """Manages a conversation with automatic rolling summarization."""

    def __init__(self, api_client: anthropic.Anthropic, max_messages: int = 10):
        self.client = api_client
        self.messages: list[dict] = []
        self.summary: str = ""
        self.max_messages: int = max_messages

    def add_message(self, role: str, content: str) -> None:
        """
        Append a message and trigger summarization if the window is full.

        Checking AFTER appending means we always see the new message before
        deciding whether to summarize — the trigger is the length exceeding
        the limit, not reaching it exactly.
        """
        self.messages.append({"role": role, "content": content})

        if len(self.messages) > self.max_messages:
            self._summarize_and_trim()

    def _summarize_and_trim(self) -> None:
        """
        Summarize older messages and keep only the most recent ones.

        We keep the last 4 messages so the model retains immediate context
        (e.g., the question it just answered). The older messages are replaced
        by a running summary that grows incrementally — each call to this method
        folds new messages into the existing summary.
        """
        # Everything except the last 4 messages will be summarized and discarded.
        to_summarize = self.messages[:-4]

        # Build the summarization prompt as plain text — no format string with
        # backslashes inside the expression (Python <3.12 limitation).
        formatted_messages = "\n".join(
            m["role"] + ": " + m["content"] for m in to_summarize
        )
        summary_prompt = (
            "Previous summary: "
            + (self.summary if self.summary else "(none)")
            + "\n\nNew messages to add to the summary:\n"
            + formatted_messages
        )

        summary_response = self.client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system=(
                "You are a conversation summarizer. "
                "Given a previous summary and new messages, produce a concise updated summary. "
                "Focus on decisions made, topics covered, and any open questions."
            ),
            messages=[{"role": "user", "content": summary_prompt}],
        )

        # Replace the accumulated summary with the new, extended one.
        self.summary = summary_response.content[0].text

        # Discard the old messages — only the recent 4 remain in the window.
        self.messages = self.messages[-4:]

    def get_system_with_summary(self) -> str:
        """Return the system prompt, prepending the summary when available."""
        if self.summary:
            return "Conversation summary so far:\n" + self.summary
        return "You are a helpful assistant."

    def chat(self, user_input: str) -> str:
        """Send a user message and get a response."""
        self.add_message("user", user_input)

        response = self.client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system=self.get_system_with_summary(),
            messages=self.messages,
        )

        assistant_reply = response.content[0].text
        self.add_message("assistant", assistant_reply)
        return assistant_reply


if __name__ == "__main__":
    manager = ConversationManager(client, max_messages=6)

    topics = [
        "Tell me about agentic loops.",
        "What about hub-and-spoke patterns?",
        "How does prompt caching work?",
        "Explain tool error handling.",
        "What is context summarization?",
        "How does human-in-the-loop work?",
        "Explain task decomposition.",
        "What have we discussed so far?",
    ]

    for topic in topics:
        print(f"User: {topic}")
        reply = manager.chat(topic)
        print(f"Assistant: {reply[:120]}...")
        print(f"  [messages in window: {len(manager.messages)}, summary: {bool(manager.summary)}]")
        print()
