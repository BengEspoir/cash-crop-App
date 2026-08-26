"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOTAL_HISTORY_LENGTH = 12000;

const WELCOME_MESSAGE = {
  id: "agriculnet-ai-welcome",
  role: "assistant",
  content: "",
  kind: "welcome",
};

let messageSequence = 0;

function createMessage(role, content) {
  messageSequence += 1;
  return {
    id: `${Date.now()}-${messageSequence}`,
    role,
    content,
  };
}

function limitHistory(messages) {
  return messages.slice(-MAX_HISTORY_MESSAGES);
}

function toRequestMessages(messages) {
  const requestMessages = [];
  let remainingCharacters = MAX_TOTAL_HISTORY_LENGTH;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.kind === "welcome") continue;

    const content = message.content.slice(0, MAX_MESSAGE_LENGTH);
    if (content.length > remainingCharacters) break;

    requestMessages.unshift({ role: message.role, content });
    remainingCharacters -= content.length;
  }

  return requestMessages;
}

function friendlyErrorKey(error) {
  const errorCode = error?.response?.data?.error?.code;

  if (
    error?.code === "ECONNABORTED" ||
    errorCode === "AI_REQUEST_TIMEOUT" ||
    error?.response?.status === 504
  ) {
    return "assistant.errorTimeout";
  }
  if (error?.code === "AI_EMPTY_REPLY") {
    return "assistant.errorGeneric";
  }
  if (errorCode === "AI_NOT_CONFIGURED") {
    return "assistant.errorNotConfigured";
  }
  if (errorCode === "AI_RATE_LIMITED" || error?.response?.status === 429) {
    return "assistant.errorRateLimit";
  }
  if (!error?.response) {
    return "assistant.errorOffline";
  }
  if ([502, 503].includes(error?.response?.status)) {
    return "assistant.errorUnavailable";
  }
  return "assistant.errorGeneric";
}

export function useAgriculNetAIChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);
  const activeRequestRef = useRef(null);

  useEffect(
    () => () => {
      activeRequestRef.current?.abort();
    },
    [],
  );

  const resetConversation = useCallback(() => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setMessages([WELCOME_MESSAGE]);
    setDraft("");
    setErrorKey(null);
    setIsLoading(false);
  }, []);

  const submitMessage = useCallback(
    async (value) => {
      const content = value.trim();
      if (!content || isLoading || activeRequestRef.current) return false;

      const userMessage = createMessage("user", content);
      const nextMessages = limitHistory([...messages, userMessage]);
      const controller = new AbortController();

      activeRequestRef.current = controller;
      setMessages(nextMessages);
      setDraft("");
      setErrorKey(null);
      setIsLoading(true);

      try {
        const response = await api.post(
          "/chat",
          { messages: toRequestMessages(nextMessages) },
          { timeout: 50000, signal: controller.signal },
        );
        const reply = response?.data?.data?.reply;

        if (typeof reply !== "string" || !reply.trim()) {
          const emptyReplyError = new Error("The AI provider returned an empty reply.");
          emptyReplyError.code = "AI_EMPTY_REPLY";
          throw emptyReplyError;
        }

        const safeReply = reply.trim().slice(0, MAX_MESSAGE_LENGTH);
        setMessages((current) =>
          limitHistory([...current, createMessage("assistant", safeReply)]),
        );
        return true;
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorKey(friendlyErrorKey(error));
        }
        return false;
      } finally {
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [isLoading, messages],
  );

  return {
    draft,
    errorKey,
    isLoading,
    maxMessageLength: MAX_MESSAGE_LENGTH,
    messages,
    resetConversation,
    setDraft,
    submitMessage,
  };
}
