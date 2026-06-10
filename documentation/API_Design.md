# API Design Specification

This document details the complete set of RESTful API endpoints for the LuxeStay Platform.

## 1. Global Specifications

*   **Base URL Path:** `/api/v1`
*   **Response Payload Format:** Application/JSON
*   **Authentication Mechanism:** HTTP Bearer token authorization.
    *   Header requirement: `Authorization: Bearer <JWT>`
*   **Access Scopes:**
    *   `[Protected]` - Requires a signature-verified JWT.
    *   `[Guest Only]` - Requester role must be `guest`.
    *   `[Host Only]` - Requester role must be `host` or `admin`.
    *   `[Admin Only]` - Requester role must be `admin`.

---

## 2. Authentication Submodule (`/api/v1/auth`)

Manages user registrations, sessions, profile settings, and credentials.

| Method | Endpoint | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | Register new profile. Payload: `email`, `password`, `name`, `role` (`guest`/`host`). | Public |
| **POST** | `/auth/login` | Authenticate session. Payload: `email`, `password`. Returns JWT token. | Public |
| **GET** | `/auth/me` | Fetch active user credentials and metadata. | `[Protected]` |
| **PATCH** | `/auth/profile` | Update profile fields (e.g. `name`, `email`, `avatar_url`). | `[Protected]` |
| **PATCH** | `/auth/change-password` | Modify user credentials. Payload: `currentPassword`, `newPassword`. | `[Protected]` |
| **DELETE**| `/auth/account` | Permanently deletes the active user's account profile. | `[Protected]` |

---

## 3. Properties Submodule (`/api/v1/properties`)

Coordinates property listings, availability queries, search terms, and image uploads.

| Method | Endpoint | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| **GET** | `/properties` | Query properties using filters: `?location=X&minPrice=Y&maxPrice=Z`. | Public |
| **GET** | `/properties/locations` | Get unified list of available cities/provinces/countries. | Public |
| **GET** | `/properties/:id` | Retrieve detailed details for a single property. | Public |
| **GET** | `/properties/:id/availability` | Fetch booked date ranges to disable on frontend calendars. | Public |
| **POST** | `/properties` | Create new listing. Payload: Multipart form (title, price, image files). | `[Protected, Host Only]` |
| **PUT** | `/properties/:id` | Modify listing. Requires the requester to own the listing. | `[Protected, Host Only]` |
| **DELETE**| `/properties/:id` | Remove listing. Requires the requester to own the listing. | `[Protected, Host Only]` |
| **GET** | `/properties/host/my-properties` | List all listings belonging to the active host. | `[Protected, Host Only]` |

---

## 4. Bookings Submodule (`/api/v1/bookings`)

Handles dates validation, reservation queries, cancellations, and exclusion checks.

| Method | Endpoint | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| **POST** | `/bookings` | Request reservation booking. Payload: `property_id`, `check_in`, `check_out`. | `[Protected, Guest Only]` |
| **GET** | `/bookings/my-bookings` | List all past and upcoming guest reservations. | `[Protected, Guest Only]` |
| **PATCH** | `/bookings/:id/cancel` | Cancel booking reservation. | `[Protected, Guest Only]` |
| **GET** | `/bookings/host/reservations` | Tabulate guest reservations for host-owned properties. | `[Protected, Host Only]` |

---

## 5. Messaging Submodule (`/api/v1/messages`)

Manages chat histories, direct threads, and lists active conversations.

| Method | Endpoint | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| **GET** | `/messages` | Returns all active conversation threads for the current user. | `[Protected]` |
| **POST** | `/messages` | Send message. Payload: `property_id`, `receiver_id`, `content`. | `[Protected]` |
| **GET** | `/messages/:bookingId` | Get messages chat history associated with a reservation booking. | `[Protected]` |
| **GET** | `/messages/:propertyId/:otherUserId` | Retrieve direct message history on a specific property. | `[Protected]` |

---

## 6. Support Tickets Submodule (`/api/v1/support`)

Coordinates guest inquiries and support requests.

| Method | Endpoint | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| **POST** | `/support` | Submit a support ticket. Payload: `name`, `email`, `subject`, `message`. | `[Protected]` |

---

## 7. Administrative Portal Submodule (`/api/v1/admin`)

Full suite of administrative tools restricted strictly to system administrators.

| Method | Endpoint | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| **GET** | `/admin/dashboard/stats` | Aggregate global platform stats (revenues, payouts, properties). | `[Protected, Admin Only]` |
| **GET** | `/admin/profile` | Retrieve active admin profile information. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/profile` | Update admin profile details. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/profile/password` | Change administrative password. | `[Protected, Admin Only]` |
| **GET** | `/admin/settings` | Get global configuration flags (maintenance mode, site fees). | `[Protected, Admin Only]` |
| **PATCH** | `/admin/settings` | Modify a platform key/value configuration. | `[Protected, Admin Only]` |
| **GET** | `/admin/users` | List all registered accounts on the platform. | `[Protected, Admin Only]` |
| **GET** | `/admin/users/:id` | Fetch specific user dossier including all logs/activities. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/users/:id/role` | Adjust user permissions scope (`guest`/`host`/`admin`). | `[Protected, Admin Only]` |
| **PATCH** | `/admin/users/:id/suspend` | Block or reactivate user accounts. | `[Protected, Admin Only]` |
| **DELETE**| `/admin/users/:id` | Irreversibly delete a user and all their related assets. | `[Protected, Admin Only]` |
| **GET** | `/admin/properties` | Fetch list of all properties across the system. | `[Protected, Admin Only]` |
| **GET** | `/admin/properties/:id` | Retrieve comprehensive property details. | `[Protected, Admin Only]` |
| **POST** | `/admin/properties` | Directly create a property listing. | `[Protected, Admin Only]` |
| **PUT** | `/admin/properties/:id` | Directly override/edit any property listing. | `[Protected, Admin Only]` |
| **DELETE**| `/admin/properties/:id` | Directly delete any property listing. | `[Protected, Admin Only]` |
| **GET** | `/admin/bookings` | List all guest bookings. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/bookings/:id/status` | Force status changes on reservation bookings. | `[Protected, Admin Only]` |
| **DELETE**| `/admin/bookings/:id` | Remove reservation booking records. | `[Protected, Admin Only]` |
| **GET** | `/admin/finance/stats` | Retrieve platform volume, fees, and host payout stats. | `[Protected, Admin Only]` |
| **GET** | `/admin/finance/payouts` | List payout ledger transactions. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/finance/payouts/:id/pay` | Mark host payout transaction status as "paid". | `[Protected, Admin Only]` |
| **POST** | `/admin/finance/refund/:bookingId` | Trigger booking refunds. | `[Protected, Admin Only]` |
| **GET** | `/admin/support` | List support tickets submitted by users. | `[Protected, Admin Only]` |
| **GET** | `/admin/support/:id` | Fetch ticket discussion context. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/support/:id/metadata` | Adjust ticket priority levels or categories. | `[Protected, Admin Only]` |
| **POST** | `/admin/support/:id/activity` | Post reply or internal note to a ticket. | `[Protected, Admin Only]` |
| **PATCH** | `/admin/support/:id/resolve` | Resolve/close support ticket. | `[Protected, Admin Only]` |
| **DELETE**| `/admin/support/:id` | Delete support ticket history from platform. | `[Protected, Admin Only]` |
| **GET** | `/admin/notifications` | Fetch active system notice queue. | `[Protected, Admin Only]` |
| **GET** | `/admin/search` | Execute platform global lookup query (`?q=query`). | `[Protected, Admin Only]` |

---

## 8. Error Response Envelope

All API errors utilize a standardized response wrapping schema:

```json
{
  "success": false,
  "error": {
    "code": "DOUBLE_BOOKING_CONFLICT",
    "message": "The selected dates are no longer available.",
    "status": 409
  }
}
```
