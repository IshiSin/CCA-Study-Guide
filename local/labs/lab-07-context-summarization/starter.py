"""
Lab 07: Context Summarization
===============================
Learning objective: Implement rolling summarization to prevent context window
overflow in long-running conversations.

The problem: the Messages API has a context window limit. A conversation with
hundreds of turns will eventually exceed it. Truncating old messages loses
information; summarizing preserves the key facts in fewer tokens.

Strategy:
  - Keep the last N messages in full (recent context is most relevant).
  - When the message list grows beyond max_messages, summarize the older
    portion and replace it with a compact summary string.
  - Prepend the summary to each new API call via the system prompt so the
    model is always aware of prior conversation history.

Your task: Implement `add_message` and `_summarize_and_trim` in
`ConversationManager`.
"""

import anthropic

client = anthropic.Anthropic()


class ConversationManager:
    """Manages a conversation with automatic rolling summarization."""

    def __init__(self, api_client: anthropic.Anthropic, max_messages: int = 10):
        self.client = api_client
        self.messages: list[dict] = []
        self.summary: str = ""          # Accumulated summary of trimmed history
        self.max_messages: int = max_messages

    def add_message(self, role: str, content: str) -> None:
        """
        Append a message to the conversation.

        TODO: Append {"role": role, "content": content} to self.messages.
        After appending, if len(self.messages) > self.max_messages, call
        self._summarize_and_trim() to compact the history.
        """
        # TODO: implement this method
        pass

    def _summarize_and_trim(self) -> None:
        """
        Summarize the older portion of the conversation and trim messages.

        TODO:
          1. Slice off all but the last 4 messages: to_summarize = self.messages[:-4]
          2. Build a prompt that includes self.summary (if any) and the messages
             to summarize.
          3. Call the API with claude-haiku-4-5 to generate a new summary.
          4. Store the result in self.summary.
          5. Keep only the last 4 messages: self.messages = self.messages[-4:]
        """
        # TODO: implement this method
        pass

    def get_system_with_summary(self) -> str:
        """
        Return a system prompt that includes the conversation summary (if any).

        This ensures the model has context about the full history even though
        only the recent messages are included in `messages`.
        """
        if self.summary:
            return "Conversation summary so far:\n" + self.summary
        return "You are a helpful assistant."

    def chat(self, user_input: str) -> str:
        """Send a user message and get a response, with automatic summarization."""
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
