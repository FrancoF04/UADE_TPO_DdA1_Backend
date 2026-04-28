# API Funcional XploreNow

Documento de referencia para frontend e integración. La base recomendada para consumo desde el cliente es `Bearer JWT` en los endpoints protegidos y JSON en todos los `POST`, `PUT` y `PATCH`.

## Convenciones generales

- `Authorization: Bearer <token>` en todos los endpoints protegidos.
- `Content-Type: application/json`.
- Respuesta estándar de éxito:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "total": 0,
    "page": 1,
    "page_size": 10,
    "limit": 10
  }
}
```

- Respuesta estándar de error:

```json
{
  "success": false,
  "error": "Mensaje descriptivo"
}
```

- Paginación estándar: `page`, `page_size`.
- En algunos listados también se acepta `limit` por compatibilidad.
- Fechas y horas en ISO 8601 con timezone.

## 1. Autenticación

Base: `/api/auth`

### POST `/api/auth/otp/request`
Solicita un OTP para login por correo.

Body:

```json
{
  "email": "juan@example.com"
}
```

### POST `/api/auth/otp/verify`
Verifica OTP y crea sesión.

Body:

```json
{
  "email": "juan@example.com",
  "code": "123456"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "token": "<access_token>",
    "accessToken": "<access_token>",
    "refreshToken": "<refresh_token>"
  }
}
```

### POST `/api/auth/otp/resend`
Reenvía OTP e invalida el anterior.

Body:

```json
{
  "email": "juan@example.com"
}
```

### POST `/api/auth/login`
Login clásico con usuario y contraseña.

Body:

```json
{
  "username": "juanperez",
  "password": "password123"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "token": "<access_token>",
    "accessToken": "<access_token>",
    "refreshToken": "<refresh_token>"
  }
}
```

### POST `/api/auth/register`
Registro de usuario nuevo.

Body:

```json
{
  "email": "new@example.com",
  "username": "newuser",
  "password": "password789",
  "fullName": "New User",
  "phoneNumber": "+5491133344455"
}
```

### POST `/api/auth/refresh`
Renueva sesión usando refresh token.

Body:

```json
{
  "refreshToken": "<refresh_token>"
}
```

### POST `/api/auth/logout`
Invalida la sesión activa.

Headers:

```http
Authorization: Bearer <access_token>
```

## 2. Perfil del viajero

Base recomendada: `/profile`

Alias disponible: `/api/profile`

### GET `/profile`
Devuelve el perfil del usuario autenticado.

Headers:

```http
Authorization: Bearer <token>
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u1",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "phone": "+5491112345678",
      "profilePhotoUrl": "",
      "preferences": {
        "categories": ["adventure"],
        "destinations": ["Buenos Aires"]
      }
    }
  }
}
```

### PATCH `/profile`
Actualiza nombre, teléfono y foto de perfil.

Body:

```json
{
  "name": "Juan Perez",
  "phone": "+5491111111111",
  "photoUrl": "https://cdn.example.com/profile.jpg"
}
```

### GET `/profile/preferences`
Recupera preferencias de viaje.

### PUT `/profile/preferences`
Guarda categorías de interés.

Body:

```json
{
  "categories": ["adventure", "cultural", "gastronomic"]
}
```

### GET `/profile/bookings-summary`
Resumen de reservas del usuario.

Respuesta:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBookings": 3,
      "confirmedBookings": 2,
      "cancelledBookings": 1,
      "finalizedBookings": 0,
      "upcomingBookings": 2,
      "completedBookings": 0,
      "totalSpent": 28000,
      "byStatus": {
        "confirmed": 2,
        "cancelled": 1
      }
    }
  }
}
```

## 3. Catálogo de actividades

Base: `/api/activities`

### GET `/api/activities`
Listado paginado con filtros combinados.

Query params:

- `page`
- `page_size`
- `destination`
- `category`
- `date`
- `priceMin`
- `priceMax`

Ejemplo:

```http
GET /api/activities?page=1&page_size=10&destination=Buenos%20Aires&category=free_tour
```

Cada ítem incluye:

- `imageUrl`
- `name`
- `destination`
- `category`
- `duration`
- `price`
- `currency`
- `availableSpots`

### GET `/api/activities/recommended`
Actividades recomendadas según preferencias del usuario.

Headers:

```http
Authorization: Bearer <token>
```

### GET `/api/activities/featured`
Actividades destacadas.

### GET `/api/activities/:id`
Detalle completo de actividad.

Incluye:

- `description`
- `included`
- `meetingPoint` con `latitude`, `longitude`, `address`
- `guide`
- `duration`
- `language`
- `cancellationPolicy`
- `galleryUrls`
- `itineraryPoints` cuando aplique

## 4. Reservas

Superficie recomendada para el front: `/api/users/reservations`

Alias mantenido: `/bookings` y `/api/bookings`

### POST `/api/users/reservations`
Crea una reserva.

Body aceptado:

```json
{
  "activityId": "a1",
  "selectedDate": "2026-04-10T10:00:00Z",
  "selectedScheduleId": "a1-s1",
  "quantity": 2
}
```

También se aceptan alias:

```json
{
  "activity_id": "a1",
  "fecha": "2026-04-10",
  "horario": "10:00:00Z",
  "participants": 2
}
```

### GET `/api/users/reservations`
Lista de reservas del usuario autenticado.

Query params:

- `page`
- `page_size`

### GET `/api/users/reservations/:id`
Detalle de una reserva.

Incluye:

- `voucherCode`
- `activity`
- `meetingPoint`
- `status`
- `selectedDate`
- `selectedScheduleId`
- `quantity`

### DELETE `/api/users/reservations/:id`
Cancela una reserva.

### POST `/api/users/reservations/:id/cancel`
Alias de cancelación.

Respuesta de cancelación:

```json
{
  "success": true,
  "data": {
    "message": "Reserva cancelada",
    "cancellationPolicy": "Cancelacion gratuita hasta 48 horas antes"
  }
}
```

### GET `/api/users/reservations/offline-bundle`
Bundle offline con reservas activas, vouchers, actividades y puntos de encuentro.

### POST `/api/users/reservations/sync`
Recibe estado local y devuelve cambios del servidor.

Body:

```json
{
  "since": "2026-04-20T00:00:00Z",
  "localState": {
    "bookingIds": ["b1", "b2"]
  }
}
```

## 5. Historial de actividades

Base: `/api/activities`

### GET `/api/activities/history`
Listado de actividades finalizadas por el usuario.

Headers:

```http
Authorization: Bearer <token>
```

Query params:

- `page`
- `page_size`
- `fecha_desde`
- `fecha_hasta`
- `destination`

Cada ítem incluye:

- `date`
- `activityName`
- `destination`
- `guide`
- `duration`

El detalle se reutiliza desde `GET /api/activities/:id` y, si existe, incluye la calificación del usuario en `userRating`.

## 6. Calificaciones

Base: `/ratings`

### POST `/ratings`
Califica una reserva finalizada.

Body:

```json
{
  "bookingId": "b1",
  "activityRating": 5,
  "guideRating": 4,
  "comment": "Excelente experiencia"
}
```

Aliases aceptados:

```json
{
  "booking_id": "b1",
  "activity_rating": 5,
  "guide_rating": 4,
  "comment": "Excelente experiencia"
}
```

### GET `/ratings/:bookingId`
Recupera la calificación del usuario para una reserva.

## 7. Favoritos

Base: `/favorites`

### POST `/favorites`
Agrega una actividad a favoritos.

Body:

```json
{
  "activityId": "a1"
}
```

### DELETE `/favorites/:activityId`
Elimina una actividad de favoritos.

### GET `/favorites`
Lista favoritos con indicadores de cambio.

Incluye:

- `priceChanged`
- `spotsChanged`
- `priceAtFavorite`
- `spotsAtFavorite`

## 8. Noticias

Base: `/news`

### GET `/news`
Listado de novedades, descuentos y promociones.

Query params:

- `page`
- `page_size`

### GET `/news/:id`
Detalle completo de la novedad.

Si está relacionada a una actividad, incluye `activityId`.

## 9. Códigos de estado esperados

- `200`: OK
- `201`: creado correctamente
- `400`: validación o datos inválidos
- `401`: autenticación requerida o token inválido
- `404`: recurso no encontrado
- `409`: conflicto de negocio, por ejemplo cupos o cancelación fuera de plazo

## 10. Rutas recomendadas para el front

Para simplificar el consumo desde el frontend, estas son las rutas que conviene usar como contrato estable:

- `GET /profile`
- `PATCH /profile`
- `GET /profile/preferences`
- `PUT /profile/preferences`
- `GET /profile/bookings-summary`
- `GET /api/activities`
- `GET /api/activities/:id`
- `GET /api/activities/recommended`
- `GET /api/activities/history`
- `GET /api/users/reservations`
- `POST /api/users/reservations`
- `GET /api/users/reservations/:id`
- `DELETE /api/users/reservations/:id`
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites/:activityId`
- `POST /ratings`
- `GET /ratings/:bookingId`
- `GET /news`
- `GET /news/:id`
