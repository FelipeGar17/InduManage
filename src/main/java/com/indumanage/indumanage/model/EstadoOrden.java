package com.indumanage.indumanage.model;

public enum EstadoOrden {
    PENDIENTE,      // Cliente creó la orden
    EN_REVISION,    // Admin está revisando
    APROBADA,       // Admin aprobó
    RECHAZADA,      // Admin rechazó
    EN_PROCESO,     // Se está preparando/entregando
    COMPLETADA,     // Finalizada
    CANCELADA       // Cliente canceló
}
