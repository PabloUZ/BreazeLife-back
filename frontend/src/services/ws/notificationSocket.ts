import { Client, type IMessage } from "@stomp/stompjs";
import type { NotificationDto } from "@/src/dtos/notification/notification.dtos";

/** Convierte http(s):// → ws(s):// y añade el endpoint nativo de STOMP */
function toWsUrl(apiUrl: string): string {
  return apiUrl.replace(/^https?/, "ws") + "/ws-native";
}

// Usa la misma variable de entorno que el cliente HTTP para garantizar
// que ambos apunten siempre al mismo servidor.
const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

const BROKER_URL = toWsUrl(API_URL);

// ─── NotificationSocket ───────────────────────────────────────────────────────

export class NotificationSocket {
  private client: Client | null = null;

  /**
   * Conecta al broker STOMP y suscribe al topic personal de notificaciones.
   * @param token      Access token JWT (se envía en el CONNECT frame)
   * @param onMessage  Callback invocado con cada notificación nueva
   * @param onConnect  Opcional: callback cuando la conexión está lista
   * @param onError    Opcional: callback cuando hay un error de conexión
   */
  connect(
    token: string,
    onMessage: (notification: NotificationDto) => void,
    onConnect?: () => void,
    onError?: (error: unknown) => void
  ): void {
    // Desactiva cualquier cliente previo antes de crear uno nuevo
    // para evitar conexiones fantasma si connect() se llama varias veces.
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.client = new Client({
      webSocketFactory: () => new WebSocket(BROKER_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 4_000,
      heartbeatOutgoing: 4_000,

      // ── Fix React Native nueva arquitectura (JSI) ────────────────────────
      // WebSocket.send(string) en JSI usa C-strings y trunca el frame STOMP
      // antes del terminador \x00, por lo que el servidor nunca lo procesa.
      // Al forzar frames binarios (Uint8Array), la longitud es explícita y
      // el \x00 llega íntegro. appendMissingNULLonIncoming cubre el caso
      // contrario: si el servidor envía texto y JSI elimina el \x00 entrante.
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      // ────────────────────────────────────────────────────────────────────

      onConnect: () => {
        this.client?.subscribe("/user/queue/notifications", (msg: IMessage) => {
          try {
            const notification = JSON.parse(msg.body) as NotificationDto;
            onMessage(notification);
          } catch {
            // Ignorar mensajes malformados
          }
        });
        onConnect?.();
      },

      onStompError: (frame) => {
        console.error(
          "[NotificationSocket] STOMP error:",
          frame.headers["message"],
          frame.body
        );
        onError?.(frame);
      },

      onWebSocketError: (event) => {
        console.error("[NotificationSocket] WebSocket error:", event);
        onError?.(event);
      },
    });

    this.client.activate();
  }

  /** Desconecta limpiamente del broker. */
  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

// Singleton — una sola conexión por sesión
export const notificationSocket = new NotificationSocket();
