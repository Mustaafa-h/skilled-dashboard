// app/dashboard/chat/page.jsx (Rooms List)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../ui/dashboard/chat/chat.module.css";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { connectSocket, onEvent, offEvent } from "../../lib/socket";
import { getChatRooms } from "../../lib/api";
import {
  MdOutlineContentPasteSearch,

} from "react-icons/md";

export default function RoomsPage() {
  const t = useTranslations();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    console.log("[RoomsPage] 🔄 Initializing rooms list");

    // Fetch via REST
    console.log("[RoomsPage] Fetching rooms via REST");
    getChatRooms()
      .then((res) => {
        if (res?.data) {
          console.log("[RoomsPage] REST rooms:", res.data);
          setRooms(res.data);
        }
      })
      .catch((err) => {
        console.warn(
          "[RoomsPage] REST rooms failed — falling back to socket",
          err
        );
        toast.error(t("chat.errorLoadingRooms"));
      });

    // Connect to socket for fallback and new rooms
    const socket = connectSocket();
    console.log("[RoomsPage] Socket.IO connected (id pending)");

    // Fallback unread counts for rooms
    const handleUnread = (counts) => {
      console.log("[Socket] event: unread_counts", counts);
      setRooms((prev) => {
        return counts.map(({ chatRoomId: id, unreadCountCompany }) => {
          const existing = prev.find((r) => r.id === id);
          return existing
            ? { ...existing, unreadCountCompany }
            : { id, unreadCountCompany };
        });
      });
    };
    onEvent("unread_counts", handleUnread);

    // Listen for new rooms being created
    const handleNewRoom = (room) => {
      console.log("[Socket] event: chat_room_created", room);
      setRooms((prev) => [room, ...prev]);
    };
    onEvent("chat_room_created", handleNewRoom);

    // Cleanup
    return () => {
      console.log("[RoomsPage] Cleaning up socket listeners");
      offEvent("unread_counts", handleUnread);
      offEvent("chat_room_created", handleNewRoom);
    };
  }, [t]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("chat.roomsTitle", { defaultValue: "Conversations" })}</h1>
      {rooms.length === 0 ? (
        <p className={styles.empty}>{t("chat.noChats")}</p>
      ) : (
        <ul className={styles.list}>
          {rooms.map((room) => (
            <li key={room.id} className={styles.item}>
              <Link
                href={`/dashboard/chat/${room.id}`}
                className={styles.link}
              >
                <div className={styles.name}>
                  {room.customerName || room.id}

                </div>
                <div className={styles.snippet}>
                  {room.lastMessageSenderId || ""}
                </div>
                <div className={styles.snippet}>
                  {room.lastMessage || ""}
                </div>
                <div className={styles.meta}>
                  {room.lastMessageTime && (
                    <span className={styles.time}>
                      {new Date(room.lastMessageTime).toLocaleTimeString()}
                    </span>
                  )}
                  {room.unreadCountCompany > 0 && (
                    <span className={styles.badge}>
                      {room.unreadCountCompany}
                    </span>
                  )}
                </div>
              </Link>
              {room.bookingId && (
                <Link
                  href={`/dashboard/orders/${room.bookingId}`}
                  className={styles.bookingLink}
                  title={t("chat.viewBooking")}
                >
                  <MdOutlineContentPasteSearch/> booking
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
