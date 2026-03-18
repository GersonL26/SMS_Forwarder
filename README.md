# SMS Forwarder MVP

Aplicación Android que intercepta SMS entrantes del dispositivo, los evalúa contra
reglas de filtrado configuradas por el usuario y los reenvía automáticamente a
Telegram.

---

## Requisitos previos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Dispositivo Android o emulador con Android 8+
- Un bot de Telegram (ver sección siguiente)

---

## Crear el bot de Telegram

1. Abrir Telegram y buscar `@BotFather`.
2. Enviar `/newbot`.
3. Seguir las instrucciones: elegir nombre y username para el bot.
4. BotFather responderá con un **token** (ej: `123456:ABC-DEF1234ghIkl-zyx57W2v`).
   Guárdalo.
5. Crear un grupo o canal en Telegram e invitar al bot.
6. Para obtener el **Chat ID**, enviar un mensaje al grupo y visitar:
   ```
   https://api.telegram.org/bot<TU_TOKEN>/getUpdates
   ```
   Buscar el campo `chat.id` en la respuesta JSON.

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/SMS_Forwarder.git
cd SMS_Forwarder

# Instalar dependencias
npm install
```

---

## Ejecutar en dispositivo/emulador Android

```bash
# Iniciar el servidor de desarrollo
npx expo start --android
```

> **Nota:** La app requiere permisos `READ_SMS` y `RECEIVE_SMS`. Se solicitarán
> automáticamente al iniciar el servicio de escucha.

---

## Ejecutar tests

```bash
# Ejecutar todos los tests
npx jest

# Ejecutar tests con reporte de cobertura
npx jest --coverage

# Ejecutar tests en modo watch
npx jest --watchAll
```

La cobertura objetivo es ≥ 70% en la capa `application/`.

---

## Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas:

```
src/
├── domain/          ← Entidades, puertos (interfaces) y servicios de dominio
├── application/     ← Casos de uso (lógica de aplicación)
├── infrastructure/  ← Implementaciones concretas (AsyncStorage, Telegram API, SMS)
└── presentation/    ← Pantallas, componentes y hooks de React Native
```

### Regla de dependencias

Las capas internas no conocen a las externas:

```
Domain ← Application ← Infrastructure
                     ← Presentation
```

- **Domain**: sin dependencias externas.
- **Application**: depende solo de Domain. Recibe dependencias por inyección.
- **Infrastructure**: implementa los puertos definidos en Domain.
- **Presentation**: consume los casos de uso a través del contenedor de dependencias.

---

## Pantallas

| Pantalla | Descripción |
|---|---|
| **Inicio** | Monitor de actividad: muestra SMS procesados con su estado (reenviado/filtrado/error) e indicador del servicio. |
| **Reglas** | Gestión de filtros: crear, editar, activar/desactivar y eliminar reglas. |
| **Configuración** | Destino Telegram: ingresar bot token y chat ID, enviar mensaje de prueba. |

---

## Stack tecnológico

| Aspecto | Decisión |
|---|---|
| Framework | React Native + Expo (bare workflow) |
| Lenguaje | TypeScript estricto |
| Plataforma | Android |
| Arquitectura | Clean Architecture |
| Persistencia | AsyncStorage |
| Destino | Telegram Bot API |
| Tests | Jest |
