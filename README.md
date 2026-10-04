# 🛒 SmartMarket — Sistema Web de Gestión Inteligente para Supermercados

**Proyecto:** Modelado, Verificación y Pruebas de Ingeniería de Sistemas  
**Integrantes:** Alejandro Botero Camacho & Santiago Sánchez Giraldo  
**Fecha:** Septiembre de 2026  

---

## 📌 1. Descripción del Proyecto
SmartMarket es una plataforma integral para la gestión operativa de un supermercado (ventas POS, inventario en tiempo real, motor de promociones automáticas, reposición de existencias y reportes gerenciales), diseñada bajo estrictos principios de **modelado formal, consistencia transaccional y verificación de reglas de negocio**.

### Reglas de Negocio Implementadas (RB-01 a RB-12):
* **RB-01:** Vigencia temporal estricta de promociones.
* **RB-02:** Descuento por volumen (2 un: 5%, 3-4 un: 10%, >=5 un: 15%).
* **RB-03:** Descuento cliente frecuente (+5%) con tope global de 20%.
* **RB-04:** Rechazo de ventas que excedan el stock disponible.
* **RB-05:** Transaccionalidad atómica (Venta + Descuento Stock + Kardex).
* **RB-06:** Invariante de inventario no negativo (`stock >= 0`).
* **RB-07:** Fórmula del Punto de Reposición: `(Ventas promedio × Tiempo entrega) + Stock seguridad`.
* **RB-08:** Alerta automática cuando `Stock actual <= Punto de reposición`.
* **RB-09:** Exclusión de ventas canceladas en reportes.
* **RB-10:** Validación temporal de reportes (`Fecha inicial <= Fecha final`).
* **RB-11:** Control de acceso exclusivo para Administrador en promociones.
* **RB-12:** Control de concurrencia y prevención de *Race Condition* en cajas simultáneas.

---

## 🏗️ 2. Arquitectura del Sistema
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS.
* **Backend:** NestJS, TypeScript, TypeORM, Swagger.
* **Base de Datos:** PostgreSQL 16 (Soporte ACID, bloqueo pesimista `SELECT ... FOR UPDATE`, Check Constraints).
* **Caché y Concurrencia:** Redis 7 (Mutex distribuido).
* **Contenedores:** Docker & Docker Compose.

---

## 🚀 3. Guía de Inicio Rápido

### Prerrequisitos:
* Node.js v20+ o v24+
* Docker Desktop (opcional para desarrollo local con PostgreSQL / Redis en contenedor)

### Pasos:

1. **Clonar y situarse en el proyecto:**
   ```bash
   cd smartmarket
   ```

2. **Levantar Base de Datos y Redis con Docker:**
   ```bash
   docker compose up -d
   ```

3. **Iniciar Backend (NestJS):**
   ```bash
   cd backend
   npm run start:dev
   ```
   * API disponible en: `http://localhost:4000/api`
   * Documentación Swagger interactiva: `http://localhost:4000/api/docs`

4. **Iniciar Frontend (Next.js):**
   ```bash
   cd frontend
   npm run dev
   ```
   * Aplicación Web disponible en: `http://localhost:3000`
