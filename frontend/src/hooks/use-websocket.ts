"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { logger } from "@/lib/logger";

interface AlertData {
  alert_type: string;
  title: string;
  message: string;
  severity: string;
}

interface WebSocketMessage {
  type: string;
  data: AlertData;
}

export function useWebSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState<AlertData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!userId) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws").replace("/api/v1", "") || "ws://localhost:8000"}/ws/${userId}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        // Debug removed;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.type === "alert") {
            setLastAlert(data.data);
            // Show browser notification if permitted
            if (Notification.permission === "granted") {
              new Notification(data.data.title, {
                body: data.data.message,
                icon: "/favicon.ico",
              });
            }
          }
        } catch (e) {
          logger.error("WebSocket message parse error:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        logger.error("WebSocket error:", error);
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      logger.error("WebSocket connection error:", e);
    }
  }, [userId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastAlert };
}
