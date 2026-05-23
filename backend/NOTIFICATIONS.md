# Notification Events

El módulo de notificaciones es completamente aislado. Los demás servicios solo publican un evento con `ApplicationEventPublisher` — el módulo de notificaciones escucha, persiste y envía por WebSocket de forma asíncrona en un hilo separado.

---

## Setup en cualquier servicio

Inyectar `ApplicationEventPublisher`:

```java
private final ApplicationEventPublisher eventPublisher;

public MiServicio(ApplicationEventPublisher eventPublisher) {
    this.eventPublisher = eventPublisher;
}
```

Luego llamar `eventPublisher.publishEvent(...)` con el evento correspondiente.

---

## Eventos disponibles

### 1. Cotización aprobada o rechazada
**Notifica a:** afiliado + empleador

```java
eventPublisher.publishEvent(new QuoteStatusChangedEvent(
    affiliateId,                        // String — ID del afiliado
    employerId,                         // String — ID del empleador
    quoteId,                            // String — ID de la cotización (ej: "QUO-000021")
    QuoteStatusChangedEvent.Status.APPROVED  // o .REJECTED
));
```

**Dónde llamarlo:** `QuoteService.approve()` y `QuoteService.reject()`

---

### 2. Pago de nómina exitoso
**Notifica a:** afiliado

```java
eventPublisher.publishEvent(new PayrollPaymentSuccessEvent(
    affiliateId   // String — ID del afiliado
));
```

**Dónde llamarlo:** `PaymentService` al confirmar el pago mensual

---

### 3. Rentabilidad mensual aplicada
**Notifica a:** afiliado

```java
eventPublisher.publishEvent(new ProfitabilityAppliedEvent(
    affiliateId,          // String — ID del afiliado
    amount                // BigDecimal — valor acreditado
));
```

**Dónde llamarlo:** `ProfitabilityService` al aplicar la rentabilidad

---

### 4. Fondos insuficientes
**Notifica a:** empleador

```java
eventPublisher.publishEvent(new InsufficientFundsEvent(
    employerId,                              // String — ID del empleador
    InsufficientFundsEvent.FundType.PAYROLL  // o .EMPLOYER_CONTRIBUTIONS
));
```

**Dónde llamarlo:** `FundsService` cuando detecta saldo insuficiente antes de un pago

---

### 5. Nueva planilla pendiente de revisión
**Notifica a:** todos los administradores

```java
eventPublisher.publishEvent(new NewPendingQuoteEvent(
    quoteId   // String — ID de la cotización registrada
));
```

**Dónde llamarlo:** `QuoteService.create()` al registrar una nueva planilla

---

## Paquete de eventos

Todos los eventos están en:
```
com.highdev.breazelife.modules.notification.events
```

| Clase | Destinatario |
|-------|-------------|
| `QuoteStatusChangedEvent` | Afiliado + Empleador |
| `PayrollPaymentSuccessEvent` | Afiliado |
| `ProfitabilityAppliedEvent` | Afiliado |
| `InsufficientFundsEvent` | Empleador |
| `NewPendingQuoteEvent` | Todos los Admin |

---

## Comportamiento

- El evento se procesa en el executor `notificationExecutor` (hilo separado), por lo que **no bloquea** la transacción principal.
- La notificación se **persiste en DB** siempre, independientemente de si el usuario está conectado.
- Si el usuario tiene una sesión WebSocket activa, recibe el mensaje **en tiempo real** en `/user/queue/notifications`.
- Si no está conectado, la notificación queda disponible en el centro de notificaciones (`GET /api/v1/{role}/notifications`).
