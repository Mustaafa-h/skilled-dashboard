// app/dashboard/chat/[roomId]/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../../ui/dashboard/chat/chatWindow.module.css";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
  onEvent,
  offEvent,
  emitEvent,
} from "../../../lib/socket";
import { getChatMessages } from "../../../lib/api";

export default function ChatWindowPage() {
  const t = useTranslations();
  const { roomId } = useParams();
  const router = useRouter();

  // State for messages, pagination, typing, and input
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef(null);

  // Load history and setup socket listeners
  useEffect(() => {
    console.log("[ChatWindow] initializing for roomId=", roomId);

    // 1) Load initial messages via REST
    console.log("[ChatWindow] fetching chat history (page=1)");
    fetchMessages(1);

    // 2) Subscribe real-time events
    const handleNewMessage = ({ chatRoomId, message }) => {
      if (chatRoomId !== roomId) return;
      console.log("[Socket] new_message for room", roomId, message);
      setMessages((prev) => [...prev, message]);
    };
    onEvent("new_message", handleNewMessage);

    // const handleMessageSent = (message) => {
    //   if (message.chatRoomId !== roomId) return;
    //   console.log("[Socket] message_sent for room", roomId, message);
    //   setMessages((prev) => [...prev, message]);
    // };
    // onEvent("message_sent", handleMessageSent);

    const handleTyping = ({ chatRoomId, isTyping: typing }) => {
      if (chatRoomId !== roomId) return;
      console.log("[Socket] user_typing for room", roomId, typing);
      setIsTyping(typing);
    };
    onEvent("user_typing", handleTyping);

    const handleRead = ({ chatRoomId }) => {
      if (chatRoomId !== roomId) return;
      console.log("[Socket] messages_read for room", roomId);
      // no action required here in UI besides clearing badges on list page
    };
    onEvent("messages_read", handleRead);

    // Cleanup on unmount
    return () => {
      console.log("[ChatWindow] cleaning up listeners");
      offEvent("new_message", handleNewMessage);
      // offEvent("message_sent", handleMessageSent);
      offEvent("user_typing", handleTyping);
      offEvent("messages_read", handleRead);
    };
  }, [roomId]);

  // REST fetch helper
  const fetchMessages = (pageNum) => {
    getChatMessages(roomId, pageNum)
      .then((res) => {
        const data = res.data.data;
        const msgs = Array.isArray(data)
          ? data
          : data.messages ?? [];
        console.log("=====data=========", data)
        console.log("[ChatWindow] fetched messages page", pageNum, msgs);
        setMessages((prev) =>
          pageNum === 1 ? msgs : [...msgs, ...prev]
        );
        setPage(pageNum);
        setHasMore(msgs.length === 50);
      })
      .catch((err) => {
        console.error("[ChatWindow] error fetching messages", err);
        toast.error(t("chat.errorLoadingHistory"));
      });
  };


  // Infinite scroll up
  const handleScroll = () => {
    console.log("scroll",containerRef.current)
    const el = containerRef.current;
    if (!el) {console.log("fetchmsgs(pg+1 not triggered",containerRef.current)};
    if (el.scrollTop === 0 && hasMore) {
      console.log("[ChatWindow] loading more messages", el);
      fetchMessages(page + 1);
    }
  };


  // Handle sending a message
  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();

    console.log("[ChatWindow] emit send_message:", content);
    emitEvent("send_message", {
      chatRoomId: roomId,
      content,
      contentType: "text",
    });

    setInputValue("");
  };

  // Typing indicator emit (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("[ChatWindow] emit typing_status:", !!inputValue);
      emitEvent("typing_status", {
        chatRoomId: roomId,
        isTyping: !!inputValue,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, roomId]);

  // Back to rooms
  const goBack = () => {
    router.push("/dashboard/chat");
  };
  useEffect(() => {
    if (messages.length > 0) {
      // Scroll to bottom after first message load
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      console.log("===========", containerRef.current.scrollHeight)
    }
  }, [messages.length]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={goBack} className={styles.backButton}>
          ← {t("chat.back", { defaultValue: "Back" })}
        </button>
        <h2 className={styles.title}>{t("chat.conversationTitle")}</h2>
      </header>

      <div
        className={styles.messagesContainer}
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.senderType === "company_admin"
                ? styles.messageOutgoing
                : styles.messageIncoming
            }
          >
            <div className={styles.meta}>
              <span className={styles.senderName}>
                {msg.senderName || t("chat.customer")}
              </span>
              <span className={styles.messageTime}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className={styles.messageContent}>
              {msg.content}
            </div>
            {msg.isRead === true && (
              <div className={styles.seenLabel}>
                {t("chat.seen", { defaultValue: "Seen" })}
              </div>
            )}

          </div>
        ))}

        {messages.length === 0 && (
          <div className={styles.emptyPlaceholder}>
            {t("chat.emptyHistory")}
          </div>
        )}
      </div>

      {isTyping && (
        <div className={styles.typingIndicator}>
          {t("chat.typing", { user: t("chat.customer") })}
        </div>
      )}

      <div className={styles.composer}>
        <input
          type="text"
          placeholder={t("chat.sendPlaceholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          {t("chat.sendButton")}
        </button>
      </div>
    </div>
  );
}
