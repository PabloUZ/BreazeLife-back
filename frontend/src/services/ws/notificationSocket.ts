import { Client, type IMessage } from "@stomp/stompjs";
import type { NotificationDto } from "@/src/dtos/notification/notification.dtos";

type MessageListener = (notification: NotificationDto) => void;
type ConnectionListener = (connected: boolean) => void;
type ErrorListener = (error: unknown) => void;

function toWsUrl(apiUrl: string): string {
  return apiUrl.replace(/^https?/, "ws") + "/ws-native";
}

const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

const BROKER_URL = toWsUrl(API_URL);

export class NotificationSocket {
  private client: Client | null = null;
  private token: string | null = null;
  private messageListeners = new Set<MessageListener>();
  private connectionListeners = new Set<ConnectionListener>();
  private errorListeners = new Set<ErrorListener>();

  connect(token: string): void {
    if (!token) return;

    if (this.client && (this.client.active || this.client.connected)) {
      if (this.token === token) {
        return;
      }
      this.disconnect();
    }

    this.token = token;
    this.client = new Client({
      webSocketFactory: () => new WebSocket(BROKER_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 4_000,
      heartbeatOutgoing: 4_000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      onConnect: () => {
        this.client?.subscribe("/user/queue/notifications", (msg: IMessage) => {
          try {
            const notification = JSON.parse(msg.body) as NotificationDto;
            this.messageListeners.forEach((listener) => listener(notification));
          } catch {
            // Ignora mensajes malformados sin afectar la conexion actual.
          }
        });
        this.notifyConnectionChange(true);
      },
      onDisconnect: () => {
        this.notifyConnectionChange(false);
      },
      onWebSocketClose: () => {
        this.notifyConnectionChange(false);
      },
      onStompError: (frame) => {
        console.error(
          "[NotificationSocket] STOMP error:",
          frame.headers["message"],
          frame.body
        );
        this.notifyConnectionChange(false);
        this.errorListeners.forEach((listener) => listener(frame));
      },
      onWebSocketError: (event) => {
        console.error("[NotificationSocket] WebSocket error:", event);
        this.notifyConnectionChange(false);
        this.errorListeners.forEach((listener) => listener(event));
      },
    });

    this.client.activate();
  }

  subscribe(
    onMessage: MessageListener,
    onConnectionChange?: ConnectionListener,
    onError?: ErrorListener
  ): () => void {
    this.messageListeners.add(onMessage);

    if (onConnectionChange) {
      this.connectionListeners.add(onConnectionChange);
      onConnectionChange(this.isConnected);
    }

    if (onError) {
      this.errorListeners.add(onError);
    }

    return () => {
      this.messageListeners.delete(onMessage);

      if (onConnectionChange) {
        this.connectionListeners.delete(onConnectionChange);
      }

      if (onError) {
        this.errorListeners.delete(onError);
      }

      if (!this.hasConsumers()) {
        this.disconnect();
      }
    };
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate({ force: true });
    }

    this.client = null;
    this.token = null;
    this.notifyConnectionChange(false);
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  private hasConsumers(): boolean {
    return (
      this.messageListeners.size > 0 ||
      this.connectionListeners.size > 0 ||
      this.errorListeners.size > 0
    );
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionListeners.forEach((listener) => listener(connected));
  }
}

export const notificationSocket = new NotificationSocket();
