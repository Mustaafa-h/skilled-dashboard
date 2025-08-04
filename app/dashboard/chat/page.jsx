// app/dashboard/chat/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../../ui/dashboard/chat/chat.module.css";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { connectSocket, onEvent } from "../../lib/socket";
import { getChatRooms, getChatMessages } from "../../lib/api";

const ChatPage = () => {
  const t = useTranslations();

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [pageByRoom, setPageByRoom] = useState({});
  const [hasMoreByRoom, setHasMoreByRoom] = useState({});
  const containerRef = useRef(null);

  // Attempt REST fetch first, then fallback to WebSocket unread_counts
  useEffect(() => {
    // 1) always connect socket for real-time updates
    const socket = connectSocket();
    console.log("[ChatPage] Socket connected for rooms and events");

    onEvent("unread_counts", (counts) => {
      console.log("[ChatPage] unread_counts:", counts);
      const stubs = counts.map(({ chatRoomId: id, unreadCount }) => ({ id, unreadCount }));
      setRooms(stubs);
    });

    // 2) try REST API for initial rooms list
    getChatRooms()
      .then((res) => {
        if (res?.data) {
          console.log("[ChatPage] REST rooms fetched:", res.data);
          setRooms(res.data);
        }
      })
      .catch((err) => {
        console.warn("[ChatPage] REST rooms failed, using socket");
      });
  }, []);

  // Fetch paginated messages via REST when selecting a room
  const selectRoom = (room) => {
    console.log("[ChatPage] selectRoom:", room);
    setActiveRoomId(room.id);
    if (!messagesByRoom[room.id]) {
      fetchMessages(room.id);
    }
  };

  const fetchMessages = (roomId, page = 1) => {
    console.log("[ChatPage] fetchMessages:", roomId, page);
    getChatMessages(roomId, page)
      .then((res) => {
        if (!res || !res.data) {
          console.error("[ChatPage] fetchMessages: no data for room", roomId);
          toast.error(t("chat.errorLoadingHistory"));
          return;
        }
        // data may be { messages: [...]} or an array directly
        const msgs = Array.isArray(res.data)
          ? res.data
          : res.data.messages ?? [];

        // Handle error shape
        if (!Array.isArray(msgs)) {
          console.error("[ChatPage] unexpected messages data for room", roomId, res.data);
          toast.error(res.data.error || t("chat.errorLoadingHistory"));
          return;
        }

        console.log("[ChatPage] messages fetched for room", roomId, msgs);
        setMessagesByRoom((prev) => ({
          ...prev,
          [roomId]: page === 1 ? msgs : [...prev[roomId] || [], ...msgs],
        }));
        setPageByRoom((prev) => ({ ...prev, [roomId]: page }));
        setHasMoreByRoom((prev) => ({ ...prev, [roomId]: msgs.length === 50 }));
      })
      .catch((err) => {
        console.error("[ChatPage] error fetching messages:", err);
        toast.error(t("chat.errorLoadingHistory"));
      });
  };

  // Infinite scroll for history
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !activeRoomId) return;
    if (el.scrollTop === 0 && hasMoreByRoom[activeRoomId]) {
      const next = (pageByRoom[activeRoomId] || 1) + 1;
      fetchMessages(activeRoomId, next);
    }
  };

  return (
    <div className={styles.container}>
      {/* Rooms list */}
      <div className={styles.rooms}>
        {rooms.length === 0 ? (
          <p>{t("chat.noChats")}</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className={`${styles.roomItem} ${room.id === activeRoomId ? styles.active : ""}`}
              onClick={() => selectRoom(room)}
            >
              <div className={styles.roomName}>{room.id}</div>
              <div className={styles.roomSnippet}>{room.lastMessage?.content || ""}</div>
              {room.unreadCount > 0 && <span className={styles.unreadBadge}>{room.unreadCount}</span>}
            </div>
          ))
        )}
      </div>

      {/* Chat window */}
      <div className={styles.chat}>
        {activeRoomId ? (
          <>
            <div
              className={styles.messagesContainer}
              ref={containerRef}
              onScroll={handleScroll}
            >
              {(messagesByRoom[activeRoomId] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.senderRole === "company_admin" ? styles.messageOutgoing : styles.messageIncoming
                  }
                >
                  <div className={styles.messageContent}>{msg.content}</div>
                  <div className={styles.messageTime}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className={styles.emptyPlaceholder}>{t("chat.emptyHistory")}</div>
          </>
        ) : (
          <div className={styles.emptyPlaceholder}>{t("chat.noChats")}</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
