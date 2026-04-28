# Testing & Quality Report - CampusNexus Booking

This section documents the comprehensive testing strategy and quality assurance measures implemented for the Booking module.

---

## 1. Backend Testing Strategy

### 1.1 Service Layer Unit Testing
We utilize **JUnit 5** and **Mockito** to isolate business logic.
- **Scenario:** `testCreateBookingWithConflict`
- **Logic:** Mock the repository to return an existing booking. Expect a `BookingConflictException` when a new creation is attempted for the same time slot.
- **Evidence:** Code coverage ensures 90%+ of the conflict detection logic is verified.

### 1.2 Integration Testing (MockMvc)
Tested the interaction between the Web Layer and the Service Layer.
- **Verification:** Sent JSON payloads to `/api/bookings` and verified the response structure using JSONPath.
- **HATEOAS Verification:** Ensured that successful responses include the required `_links` object for self-discovery.

---

## 2. Robust Validation & Error Handling

### 2.1 The "Fault-Tolerant" System
The application is designed to handle errors without revealing internal system details (Stack Traces).

| Scenario | HTTP Status | Backend Exception | Frontend Feedback |
| :--- | :--- | :--- | :--- |
| Past Date Selection | `400 Bad Request` | `InvalidBookingStateException` | Red toast notification: "Date cannot be in the past" |
| Double-Booking | `409 Conflict` | `BookingConflictException` | UI Conflict Modal highlighting the overlap |
| Expired Token | `401 Unauthorized` | `JwtException` | Auto-redirect to Login page |
| Missing Resource | `404 Not Found` | `BookingNotFoundException` | 404 Error Hero Section |

### 2.2 Server-Side Constraint Validation
We use **Jakarta Validation** annotations on our DTOs:
- `@NotBlank`: Ensures Student Name and Purpose are provided.
- `@Min(1)`: Prevents zero or negative attendee counts.
- `@Pattern`: Enforces the university-specific 'ITXXXXXX' registration number format.

---

## 3. Postman Collection Documentation

The following scenarios are verified in our Postman Collection to ensure cross-tier reliability:

| Test CASE ID | Title | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TEST-01** | Create Valid Booking | Verify full lifecycle from POST to DB. | `201 Created` + URI |
| **TEST-02** | Fetch QR Token | Verify QR generation for Approved bookings. | `200 OK` + Base64 PNG string |
| **TEST-03** | Admin Approval | Verify state transition by ROLE_ADMIN. | `200 OK` (Status: APPROVED) |
| **TEST-04** | Conflict Check | Attempt double-booking on same room. | `409 Conflict` |
| **TEST-05** | Unauthorized Access| Access Admin Review without Admin Token. | `403 Forbidden` |

---

## 4. Frontend Quality Assurance
- **Real-Time Input Debouncing:** Validates inputs as the user types to prevent unnecessary API calls.
- **State Cleanup:** Ensures that scanner camera resources are correctly released when the user leaves the Admin Scanner page, preventing memory leaks.
