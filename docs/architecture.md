# System Design

## 1. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Build a responsive, component-based user interface and provide fast development tooling. |
| Frontend Language | JavaScript | Implement UI behavior, API integration, and frontend state management. |
| Backend | Java 21 + Spring Boot | Implement business logic, REST APIs, validation, and application configuration. |
| REST API | Spring Web | Expose HTTP endpoints for creating, retrieving, searching, and managing repair requests. |
| Database | MySQL | Persist repair requests, equipment information, statuses, timestamps, and processing results. |
| Data Access | Spring Data JPA + Hibernate | Map Java entities to database tables and simplify database operations. |
| Real-Time Communication | Spring WebSocket + STOMP | Push request creation and status-change events to connected frontend clients. |
| Background Processing | Spring ThreadPoolTaskExecutor | Execute multiple simulated repair operations concurrently without blocking incoming API requests. |
| API Testing | Postman | Test REST endpoints, request validation, error handling, and API responses. |
| Version Control | Git + GitHub | Track code changes, maintain meaningful commit history, and host the project repository. |

### Technology Stack Justification

The selected stack uses React for a responsive frontend and Spring Boot for a structured Java backend. MySQL provides persistent relational storage, while Spring Data JPA simplifies database integration.

Spring WebSocket with STOMP supports server-pushed updates to connected clients without relying on polling as the primary update mechanism. Spring's ThreadPoolTaskExecutor provides a configurable worker pool for concurrent background processing.

This stack supports the assignment's mandatory requirements while keeping the application modular and achievable within the assessment deadline. Additional infrastructure such as Redis, Kafka, and microservices is unnecessary for the initial MVP.


## 2. High-Level Architecture

The system consists of a React frontend, a Spring Boot backend, a MySQL database, and a background worker pool. REST APIs handle user actions and data retrieval, WebSocket delivers real-time updates, and background workers simulate repair processing without blocking incoming API requests.

```mermaid
flowchart TB
    UI["React + Vite Frontend"]
    API["Spring Boot REST API"]
    WS["WebSocket + STOMP"]
    SERVICE["Service Layer"]
    REPO["Repository Layer"]
    DB[("MySQL Database")]
    WORKERS["Background Worker Pool"]

    UI -->|"HTTP requests"| API
    API --> SERVICE
    SERVICE --> REPO
    REPO --> DB
    SERVICE -->|"Submit processing task"| WORKERS
    WORKERS -->|"Persist status and result"| REPO
    SERVICE -->|"Publish events"| WS
    WS -->|"Live status updates"| UI


    SERVICE -->|"Submit processing task"| WORKERS
    WORKERS -->|"Persist status and result"| REPO
    SERVICE -->|"Publish events"| WS
    WS -->|"Live status updates"| UI
```

## 3. Backend Component Diagram


```mermaid

flowchart TB
    %% A. Client Layer
    subgraph CLIENT["A. Client Layer - React + Vite"]
        direction TB
        FORM["RepairRequestForm<br/>Submit repair requests"]
        DASH["RequestDashboard<br/>View, search, and filter"]
        DETAILS["RequestDetails<br/>View details and progress"]
        CONTROLS["SupervisorControls<br/>Manage request statuses"]
        WSCLIENT["WebSocketClient<br/>Receive live events and update UI"]
    end

    %% Communication
    REST["REST Requests / Responses"]
    WSCONN["WebSocket Events"]

    %% B. Spring Boot Backend
    subgraph BACKEND["B. Spring Boot Backend"]
        direction TB

        subgraph CONTROLLER_LAYER["1. Controller Layer"]
            CTRL["RepairRequestController<br/>Receive HTTP requests and return responses"]
            ERROR["GlobalExceptionHandler<br/>Handle application errors"]
        end

        subgraph SERVICE_LAYER["2. Service Layer"]
            SERVICE["RepairRequestService<br/>Business rules, creation, status validation"]
            PROCESSOR["RepairProcessingService<br/>Simulate repair work asynchronously"]
            EXECUTOR["TaskExecutorConfig<br/>Configure background worker pool"]
            PUBLISHER["RequestEventPublisher<br/>Publish creation and status events"]
        end

        subgraph REPOSITORY_LAYER["3. Repository Layer"]
            REPO["RepairRequestRepository<br/>Database operations using Spring Data JPA"]
        end

        subgraph SUPPORT["Supporting Models and Data"]
            ENTITY["RepairRequest<br/>Database entity"]
            STATUS["RepairRequestStatus<br/>Status enum"]
            DTO["Request / Response DTOs<br/>API input and output structures"]
        end

        subgraph REALTIME["Real-Time Communication"]
            WSCONFIG["WebSocketConfig<br/>Configure WebSocket and STOMP"]
            STOMP["WebSocket + STOMP<br/>Deliver events to connected clients"]
        end
    end

    %% Database
    DB[("MySQL Database<br/>Persistent repair records")]

    %% REST flow
    FORM --> REST
    DASH --> REST
    DETAILS --> REST
    CONTROLS --> REST
    REST --> CTRL
    CTRL --> SERVICE
    CTRL -.-> ERROR
    CTRL -.-> DTO
    SERVICE --> REPO
    REPO --> DB
    REPO -.-> ENTITY
    ENTITY -.-> STATUS

    %% Background processing
    SERVICE -->|"Submit task"| EXECUTOR
    EXECUTOR --> PROCESSOR
    PROCESSOR -->|"Save progress and result"| REPO

    %% Real-time events
    SERVICE -->|"Request created / status changed"| PUBLISHER
    PROCESSOR -->|"Progress / completion / failure"| PUBLISHER
    PUBLISHER --> STOMP
    WSCONFIG --> STOMP
    STOMP --> WSCONN
    WSCONN --> WSCLIENT
    WSCLIENT --> DASH
    WSCLIENT --> DETAILS
    WSCLIENT --> CONTROLS

    %% Styling
    classDef frontend fill:#E0F2FE,stroke:#0284C7,color:#0C4A6E
    classDef backend fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    classDef support fill:#F3E8FF,stroke:#9333EA,color:#581C87
    classDef database fill:#D1FAE5,stroke:#059669,color:#064E3B

    class FORM,DASH,DETAILS,CONTROLS,WSCLIENT frontend
    class CTRL,SERVICE,REPO,PROCESSOR,EXECUTOR,PUBLISHER,ERROR,WSCONFIG,STOMP backend
    class ENTITY,STATUS,DTO support
    class DB database
```
## 4. Entity-Relationship Diagram(ERD)
```mermaid
erDiagram
    USER ||--o{ SERVICE_REQUEST : creates
    EQUIPMENT ||--o{ SERVICE_REQUEST : concerns
    SERVICE_REQUEST ||--o{ REQUEST_STATUS_HISTORY : records
    USER o|--o{ REQUEST_STATUS_HISTORY : performs

    USER {
        BIGINT id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR role
    }

    EQUIPMENT {
        BIGINT id PK
        VARCHAR category
        VARCHAR model
        VARCHAR asset_tag
        VARCHAR serial_number
    }

    SERVICE_REQUEST {
        BIGINT id PK
        VARCHAR request_number UK
        BIGINT equipment_id FK
        BIGINT created_by FK
        TEXT reported_issue
        VARCHAR status
        INT progress
        VARCHAR progress_message
        TEXT result_summary
        TEXT error_message
        DATETIME created_at
        DATETIME updated_at
        DATETIME started_at
        DATETIME finished_at
    }

    REQUEST_STATUS_HISTORY {
        BIGINT id PK
        BIGINT request_id FK
        BIGINT changed_by FK
        VARCHAR actor_type
        VARCHAR old_status
        VARCHAR new_status
        VARCHAR message
        DATETIME changed_at
    }
```
