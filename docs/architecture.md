# Architecture Design Specification - CampusNexus

This document details the architectural patterns and structural design of the CampusNexus Booking System.

---

## 1. Overall System Architecture
CampusNexus follows a **Decoupled 3-Tier Architecture**, ensuring that the frontend and backend can evolve independently.

```mermaid
graph LR
    subgraph "Client Tier (Presentation)"
        A[React SPA]
    end

    subgraph "Logic Tier (Application)"
        B[Spring Security Filter / JWT]
        C[Spring Boot REST API]
    end

    subgraph "Data Tier"
        D[(Relational Database)]
    end

    A -- "HTTPS / JSON + JWT" --> B
    B -- "Principal Context" --> C
    C -- "JPA / Hibernate" --> D
```

**Key Architectural Decisions:**
- **Statelessness:** The server does not store session data. Every request is verified via a JWT token in the header.
- **Cross-Origin Resource Sharing (CORS):** Managed via backend configuration to allow the React frontend (Port 5173/3000) to communicate with the API (Port 8081).

---

## 2. REST API Architecture (Backend)
The backend implementation follows the **N-Tier Layered Pattern**, strictly separating the transport protocol (HTTP) from the business logic.

```mermaid
sequenceDiagram
    participant C as Client (Frontend)
    participant Ctrl as BookingController
    participant Serv as BookingService
    participant Repo as BookingRepository
    participant DB as Database

    C->>Ctrl: POST /api/bookings (JSON)
    Ctrl->>Serv: validate & createBooking(DTO)
    Serv->>Repo: findConflictingBookings()
    Repo->>DB: SQL Query
    DB-->>Repo: Result
    Serv->>Repo: save(Entity)
    Repo->>DB: INSERT
    Serv-->>Ctrl: BookingResponse (DTO)
    Ctrl-->>C: 201 Created + HATEOAS Links
```

**Architecture Components:**
- **Data Transfer Objects (DTO):** Prevents internal database entities from being exposed directly to the client.
- **HATEOAS Provider:** Injected into Controllers to provide hypermedia links (`self`, `cancel`, `approve`), making the API self-discoverable.
- **Global Exception Handler:** A centralized `@ControllerAdvice` that converts backend exceptions into standard RFC 7807 problem details.

---

## 3. Front-End Architecture (Frontend)
The frontend utilizes a **Component-Service Architecture** built on React, emphasizing reusability and theme consistency.

```mermaid
graph TD
    subgraph "Routing Layer"
        R[React Router]
    end

    subgraph "Page Layer (Smart Components)"
        P1[AdminDashboard]
        P2[CreateBooking]
        P3[BookingScanner]
    end

    subgraph "Logic Layer"
        S[Central API Services]
        H[Custom Hooks]
    end

    subgraph "Visual Layer (Dumb Components)"
        V1[Midnight-Indigo Theme]
        V2[Micro-Animations]
    end

    R --> P1 & P2 & P3
    P1 & P2 & P3 --> S
    P1 & P2 & P3 --> H
    P1 & P2 & P3 --> V1
    V1 --> V2
```

**Key Architectural Decisions:**
- **Modular Services:** All API interaction logic is abstracted into `services/` files, keeping components UI-focused.
- **CSS Variable System:** The "Midnight-Indigo" theme is implemented using CSS variables (Design Tokens) for easy global updates.
- **Conditional Rendering:** Used to manage complex states such as QR Scanning vs. Manual Review in the Admin module.
