# System Requirements Specification - CampusNexus Booking Module

## 1. Introduction
### 1.1 Purpose
This document provides a comprehensive specification of the functional and non-functional requirements for the CampusNexus Facility Booking System. It serves as the primary reference for developers, testers, and stakeholders to ensure the system meets its intended academic and administrative goals.

### 1.2 Scope
The scope of this module includes the end-to-end booking lifecycle, from student requisition to administrative approval and physical facility check-in via QR technology. It encompasses both a Spring Boot REST API and a React-based client application.

---

## 2. System Stakeholders
### 2.1 Student Users
The primary beneficiaries who require a seamless interface to discover, book, and manage facility reservations for academic purposes.
### 2.2 Administrative Users
Staff members responsible for reviewing booking requests, managing facility utilization, and verifying student attendance at the venues.

---

## 3. Functional Requirements: Student REST API
The Student API handles all public and semi-private interactions related to individual bookings.

| Req ID | Title | Description |
| :--- | :--- | :--- |
| **FR-API-S01** | **Booking Creation** | The system must allow students to submit a booking request containing: Student Name, Reg No, Venue ID, Date, Start/End Time, and Purpose. |
| **FR-API-S02** | **Personal Booking Retrieval** | The system must provide a list of all bookings associated with a specific Student ID, including their current statuses (Pending, Approved, Rejected, Cancelled). |
| **FR-API-S03** | **Reservation Modification** | The system must allow students to update the details of a booking **ONLY** if its current status is 'PENDING'. |
| **FR-API-S04** | **Booking Cancellation** | Students must be able to cancel a reservation at any time before the event starts (Soft Delete). | **Delete** |
| **FR-API-S05** | **Secure QR Generation** | For 'APPROVED' bookings, the API must generate a cryptographically signed token. | Read |

---

## 4. Functional Requirements: Administrative REST API
The Administrative API provides restricted access to management-level operations and system-wide data.

| Req ID | Title | Description |
| :--- | :--- | :--- |
| **FR-API-A01** | **System-Wide Reservation Log** | Admins must be able to fetch all bookings across the entire system with server-side filtering and sorting capabilities. |
| **FR-API-A02** | **Approval Workflow** | The system must allow admins to transition a 'PENDING' booking to 'APPROVED', while optionally adding official remarks. |
| **FR-API-A03** | **Rejection Workflow** | Admins must be able to 'REJECT' a booking with a mandatory reason field to inform the student of the decision. |
| **FR-API-A04** | **Check-in Verification** | The system must provide an endpoint to verify a student's QR token against the database and record the time of entry. |
| **FR-API-A05** | **Management Statistics** | (Optional/Expansion) The API should expose summary data for dashboard widgets (e.g., total pending counts). |

---

## 5. Functional Requirements: Student Web Application (UI)
The frontend must provide a premium user experience for students on both desktop and mobile.

| Req ID | Title | Description |
| :--- | :--- | :--- |
| **FR-WEB-S01** | **Split-Pane Booking Form** | A dual-pane interface where the left side handles resource selection and the right side captures student credentials. |
| **FR-WEB-S02** | **Real-Time Venue Visualizer** | A dynamic card display showing the venue image, location, and capacity as the user selects different facilities. |
| **FR-WEB-S03** | **My Bookings Dashboard** | A centralized view for students to monitor their requests, featuring status-colored badges and quick-action buttons. |
| **FR-WEB-S04** | **Identity Integrity Lock** | During modification, the Student Name and Registration Number must be disabled (read-only) to prevent identity forgery. |
| **FR-WEB-S05** | **Behavioral Agreement** | A mandatory checkbox for 'Behavioral Terms' that must be ticked before the 'Submit' button becomes active. |

---

## 6. Functional Requirements: Administrative Dashboard (UI)
The admin interface focuses on efficiency and clarity for rapid decision-making.

| Req ID | Title | Description |
| :--- | :--- | :--- |
| **FR-WEB-A01** | **Actionable Reservation Feed** | A high-density data grid highlighting 'Pending' requests that require immediate attention. |
| **FR-WEB-A02** | **Integrated QR Scanner** | A dedicated page that accesses the device camera to scan student passes and provide instant pass/fail feedback. |
| **FR-WEB-A03** | **Quick-Edit Decision Remarks** | Ability to modify the 'Reason for Approval/Rejection' directly on the review page before final submission. |
| **FR-WEB-A04** | **Automated Navigation Sync** | Upon approving/rejecting a booking, the UI must redirect to the log and auto-scroll to the modified record with a 'Pulse' animation. |

---

## 7. Data Validation & Business Logic
These requirements define the "Rules" of the system enforced by the backend service layer.

- **VAL-LOG-01: Time Conflict Enforcement** — The system must prevent two bookings for the same venue from overlapping in time on the same date.
- **VAL-LOG-02: Capacity Guardrails** — The system must throw an error if the 'Expected Attendees' count exceeds the venue's defined capacity.
- **VAL-LOG-03: Future-Date Enforcement** — Bookings cannot be made for past dates or times.
- **VAL-LOG-04: Status Transition Integrity** — A booking cannot move from 'REJECTED' or 'CANCELLED' back to 'PENDING'; it must follow a strict one-way state machine.

---

## 8. Non-Functional Requirements: Security
- **NFR-SEC-01: JWT Authentication** — All API calls must be secured via JSON Web Tokens passed in the Authorization header.
- **NFR-SEC-02: Role-Based Access Control (RBAC)** — Strict separation between `ROLE_STUDENT` and `ROLE_ADMIN`. Students must not be able to access any endpoint prefixed with `/api/admin/**`.
- **NFR-SEC-03: Input Sanitization** — All user input (Purpose, Remarks) must be sanitized to prevent Cross-Site Scripting (XSS) and SQL Injection.

---

## 9. Non-Functional Requirements: Performance
- **NFR-PER-01: Low Latency Responses** — All booking conflict checks must complete in under 200ms to ensure a "snappy" user experience.
- **NFR-PER-02: Concurrent Request Handling** — The system must handle at least 50 concurrent booking attempts without database deadlock.
- **NFR-PER-03: Asset Optimization** — UI images (Venues) should be lazy-loaded or compressed to minimize initial page load time.

---

## 10. Non-Functional Requirements: Scalability
- **NFR-SCA-01: Stateless Backend** — The Spring Boot server must not store session data in memory, allowing for horizontal scaling across multiple instances.
- **NFR-SCA-02: Modular Components** — The React frontend must use modular component architecture (Hooks and Services) to facilitate future feature expansion.

---

## 11. Non-Functional Requirements: Usability & UX Aesthetics
- **NFR-USA-01: Midnight-Indigo Design System** — The UI must follow a consistent premium dark-mode theme using HSL-based color palettes.
- **NFR-USA-02: Responsive Design** — The system MUST be fully functional on devices ranging from 360px (mobile) to 1920px (desktop) width.
- **NFR-USA-03: Visual Feedback (Toast & Pulse)** — Every user action (Success/Error) must be accompanied by a non-intrusive Toast notification and subtle CSS animations.

---

## 12. Non-Functional Requirements: Reliability & Availability
- **NFR-REL-01: Graceful Error Handling** — The system must provide human-readable error messages for common failures (e.g., "Network Error", "Venue already booked").
- **NFR-REL-02: Database Consistency** — Use of `@Transactional` annotations in the backend to ensure data integrity during complex booking operations.

---

## 13. Technological Stack Requirements
- **Backend:** Java 17+, Spring Boot 3.x, Spring Security, Hibernate ORM.
- **Frontend:** React 18+, Vite, Vanilla CSS 3 (Custom Themes).
- **Database:** MySQL 8.0+.
- **QR Engine:** Google ZXing or equivalent for token generation/decoding.

---

## 14. External Interface Requirements
- **Hardware:** Administrative devices require a functional camera for QR scanning capabilities.
- **Network:** Requires a stable internet connection; the API must be reachable over HTTP/HTTPS ports (e.g., 8081).
- **Browser:** Support for modern Evergreen browsers (Chrome, Firefox, Safari, Edge).

---

## 15. Requirements Traceability Matrix
This table maps functional requirements to their specific implementation files in the codebase.

| Req ID | Implementation File (Backend) | Implementation File (Frontend) |
| :--- | :--- | :--- |
| **FR-API-Sxx** | `BookingController.java`, `BookingServiceImpl.java` | `booking-service.js` |
| **FR-API-Axx** | `AdminBookingController.java`, `AdminBookingServiceImpl.java` | `admin-service.js` |
| **FR-WEB-Sxx** | N/A | `CreateBooking.jsx`, `MyBookings.jsx` |
| **FR-WEB-Axx** | N/A | `AdminBookingDashboard.jsx`, `AdminBookingScanner.jsx` |
| **VAL-LOG-xx** | `BookingServiceImpl.java` | `CreateBooking.jsx` (Client-side checks) |
| **NFR-SEC-xx** | `SecurityConfig.java`, `JwtFilter.java` | `AuthContext.jsx` |
