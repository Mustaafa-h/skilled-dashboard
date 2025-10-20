// app/dashboard/chat/[roomId]/page.jsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../../ui/dashboard/chat/chatWindow.module.css";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { onEvent, offEvent, emitEvent } from "../../../lib/socket";
import { getChatMessages } from "../../../lib/api";

export default function ChatWindowPage() {
  const t = useTranslations();
  const { roomId } = useParams();
  const router = useRouter();

  // ---- constants ----
  const LIMIT = 50; // server default
  console.log("[Chat] render roomId:", roomId, "LIMIT:", LIMIT);

  // ---- state / refs ----
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [observerReady, setObserverReady] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const containerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const initialLoadRef = useRef(true); // only auto-scroll once on first page
  const prevScrollTopRef = useRef(0);

  // --- helpers ---
  const debugContainer = (label) => {
    const el = containerRef.current;
    if (!el) {
      console.log(`[Chat][${label}] containerRef=null`);
      return;
    }
    console.log(
      `[Chat][${label}] scrollTop=${el.scrollTop}, clientHeight=${el.clientHeight}, scrollHeight=${el.scrollHeight}`
    );
  };

  const scrollToBottom = (reason = "unknown") => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      console.log("[Chat] scrollToBottom done. reason:", reason);
      debugContainer("after scrollToBottom");
    });
  };

  // ---- REST fetch (supports initial / older modes) ----
  const fetchMessages = (pageNum, { mode = "initial" } = {}) => {
    const el = containerRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;

    if (mode === "older") {
      prevScrollTopRef.current = prevScrollTop;
      if (loadingOlder || !hasMore) {
        console.log(
          "[Chat] skip fetch older: loadingOlder=",
          loadingOlder,
          "hasMore=",
          hasMore
        );
        return;
      }
      setLoadingOlder(true);
    }

    console.log(
      "[Chat] fetchMessages ->",
      { mode, pageNum, prevScrollTop, prevScrollHeight }
    );

    getChatMessages(roomId, pageNum, LIMIT)
      .then((res) => {
        const data = res?.data?.data;
        const msgs = Array.isArray(data) ? data : data?.messages ?? [];
        console.log(
          "[Chat] fetchMessages success",
          { mode, pageNum, returned: msgs.length }
        );

        // Prepend older page; first page replaces
        setMessages((prev) => {
          const next = pageNum === 1 ? msgs : [...msgs, ...prev];
          console.log(
            "[Chat] setMessages",
            { prevLen: prev.length, nextLen: next.length, mode, pageNum }
          );
          return next;
        });

        setPage(pageNum);
        setHasMore(msgs.length === LIMIT);
        console.log("[Chat] pagination set", {
          page: pageNum,
          hasMore: msgs.length === LIMIT,
        });

        // Restore viewport when loading older
        if (mode === "older" && el) {
          requestAnimationFrame(() => {
            const newScrollHeight = el.scrollHeight;
            const delta = newScrollHeight - prevScrollHeight;
            const newTop = prevScrollTopRef.current + delta;
            el.scrollTop = newTop;
            console.log(
              "[Chat] restore viewport after prepend",
              { prevScrollTop, prevScrollHeight, newScrollHeight, delta, newTop }
            );
            debugContainer("after restore");
          });
        }
      })
      .catch((err) => {
        console.error("[Chat] fetchMessages error", err);
        toast.error(t("chat.errorLoadingHistory"));
      })
 .finally(() => {
  if (mode === "older") {
    setLoadingOlder(false);
    console.log("[Chat] fetchMessages older finished");

    // If we were bootstrapping (first page exactly fit),
    // arm the observer only after the list is scrollable,
    // then pin to bottom once so the user starts at latest.
    if (bootstrapping) {
      const el2 = containerRef.current;
      const canScrollNow = el2 ? el2.scrollHeight > el2.clientHeight + 2 : false;
      console.log("[Chat] post-bootstrap canScroll:", canScrollNow, {
        scrollHeight: el2?.scrollHeight, clientHeight: el2?.clientHeight
      });

      if (canScrollNow) {
        setObserverReady(true);
        console.log("[Chat] observerReady=true (post-bootstrap)");

        // 🔽 NEW: pin to bottom once after bootstrap so we don't remain at top
        requestAnimationFrame(() => {
          const el3 = containerRef.current;
          if (!el3) return;
          el3.scrollTop = el3.scrollHeight;
          console.log("[Chat] post-bootstrap pinned to bottom");
        });
      }
      setBootstrapping(false);
    }
  }
});

  };

  // ---- mount: load first page + sockets ----
  useEffect(() => {
    console.log("[Chat] mount -> roomId:", roomId);

    // initial load
    fetchMessages(1, { mode: "initial" });

    // realtime: new_message
    const handleNewMessage = ({ chatRoomId, message }) => {
      if (chatRoomId !== roomId) return;
      const el = containerRef.current;
      const atBottom = el
        ? el.scrollHeight - el.scrollTop - el.clientHeight <= 40
        : true;

      console.log("[Chat][Socket] new_message", {
        atBottom,
        currentLen: messages.length,
        incomingId: message?.id,
      });

      setMessages((prev) => {
        const next = [...prev, message];
        console.log("[Chat] setMessages (socket append)", {
          prevLen: prev.length,
          nextLen: next.length,
        });
        return next;
      });

      if (atBottom && el) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
          console.log("[Chat] kept pinned to bottom on new message");
          debugContainer("after pin bottom");
        });
      }
    };
    onEvent("new_message", handleNewMessage);

    const handleTyping = ({ chatRoomId, isTyping: typing }) => {
      if (chatRoomId !== roomId) return;
      console.log("[Chat][Socket] typing:", typing);
      setIsTyping(typing);
    };
    onEvent("user_typing", handleTyping);

    const handleRead = ({ chatRoomId }) => {
      if (chatRoomId !== roomId) return;
      console.log("[Chat][Socket] messages_read");
      // noop in UI here
    };
    onEvent("messages_read", handleRead);

    return () => {
      console.log("[Chat] unmount -> remove listeners");
      offEvent("new_message", handleNewMessage);
      offEvent("user_typing", handleTyping);
      offEvent("messages_read", handleRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ---- auto-scroll ONLY after very first load (layout-stable) ----
  useLayoutEffect(() => {
    if (!containerRef.current || messages.length === 0) return;

    if (initialLoadRef.current) {
      console.log("[Chat] initialLoad -> scrolling to bottom");
      debugContainer("before initial bottom");
      // two RAFs ensures layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = containerRef.current;
          el.scrollTop = el.scrollHeight;
          debugContainer("after initial bottom");
          initialLoadRef.current = false;

          // Only arm observer if scrollable; otherwise bootstrap next page
          const canScroll = el.scrollHeight > el.clientHeight + 2;
          console.log("[Chat] canScroll after initial:", canScroll, {
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
          });

          if (canScroll) {
            setObserverReady(true);
            console.log("[Chat] observerReady=true (scrollable)");
          } else if (hasMore && !bootstrapping) {
            console.log("[Chat] not scrollable, bootstrapping page 2");
            setBootstrapping(true);
            fetchMessages(2, { mode: "older" }); // load one older page silently
          } else {
            setObserverReady(false);
            console.log("[Chat] observer not armed (no more pages)");
          }
        });
      });
    }
  }, [messages.length, hasMore, bootstrapping]);

  // ---- IntersectionObserver: load older when top sentinel visible ----
  useEffect(() => {
    if (!observerReady) {
      console.log("[Chat][Observer] not ready yet");
      return;
    }
    const root = containerRef.current;
    const target = topSentinelRef.current;
    if (!root || !target) {
      console.log("[Chat][Observer] missing root/target", { root: !!root, target: !!target });
      return;
    }

    console.log("[Chat][Observer] attaching", { page, hasMore, loadingOlder });

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log("[Chat][Observer] entry", {
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
          page,
          hasMore,
          loadingOlder,
        });
        if (entry.isIntersecting && hasMore && !loadingOlder) {
          console.log("[Chat][Observer] LOAD OLDER -> page", page + 1);
          fetchMessages(page + 1, { mode: "older" });
        }
      },
      { root, rootMargin: "0px", threshold: 0.1 }
    );

    observer.observe(target);
    return () => {
      console.log("[Chat][Observer] disconnect");
      observer.disconnect();
    };
  }, [observerReady, page, hasMore, loadingOlder]);

  // ---- send message ----
  const sendMessage = () => {
    const content = inputValue.trim();
    if (!content) return;

    console.log("[Chat] sendMessage", { contentLen: content.length });
    emitEvent("send_message", {
      chatRoomId: roomId,
      content,
      contentType: "text",
    });
    setInputValue("");
  };

  // ---- typing status (debounced) ----
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("[Chat] typing_status emit:", !!inputValue);
      emitEvent("typing_status", {
        chatRoomId: roomId,
        isTyping: !!inputValue,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, roomId]);

  // ---- back to rooms ----
  const goBack = () => {
    console.log("[Chat] goBack");
    router.push("/dashboard/chat");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={goBack} className={styles.backButton}>
          ← {t("chat.back", { defaultValue: "Back" })}
        </button>
        <h2 className={styles.title}>{t("chat.conversationTitle")}</h2>
      </header>

      <div className={styles.messagesContainer} ref={containerRef}   style={{ overflowAnchor: "none" }}>
        {/* Top sentinel watched by IntersectionObserver */}
        <div ref={topSentinelRef} style={{ height: 1 }} />

        {/* Loader when fetching older pages */}
        {loadingOlder && (
          <div className={styles.topLoader}>
            {t("chat.loadingOlder", {
              defaultValue: "Loading earlier messages…",
            })}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id ?? `${msg.createdAt}-${idx}`}
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

            <div className={styles.messageContent}>{msg.content}</div>

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
          onFocus={() => debugContainer("onFocus input")}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          {t("chat.sendButton")}
        </button>
      </div>
    </div>
  );
}
