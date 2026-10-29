# System Analysis

## Project Title: IT Equipment Repair Service Request Management System

### Domain Selection and Rationale

The assignment describes a generic Real-Time Service Request Management System. To make the business case more realistic and demonstrate domain-specific requirement analysis, this project specializes in **IT equipment repair and servicing**, including laptops, desktop computers, servers, and networking devices.

The system is inspired by the operational needs of IT repair service organizations that receive equipment-related service requests and coordinate their processing. It focuses on request submission, repair progress tracking, supervisor monitoring, concurrent background processing, and real-time status notifications.

This is not intended to be a complete repair-service marketplace of an existing commercial platform. Vendor marketplaces, quotations, payments, pickup and delivery logistics, and external service-provider integrations are outside the initial MVP scope.

The selected domain provides a practical context for demonstrating all mandatory technical requirements of the assignment while keeping the implementation achievable within the assessment deadline.

## 1. Problem Statement

Organizations and individuals rely on IT equipment for their daily activities. When equipment fails, managing repair requests manually can create several problems:

- **Unorganized requests:** Repair requests may be recorded through messages, phone calls, or informal communication.

- **Limited visibility:** Users may not know whether a request is pending, being processed, completed, or failed.

- **Delayed updates:** Users and supervisors may need to contact technicians repeatedly to learn about progress.

- **Processing delays:** Time-consuming repair-request processing can block other operations if it runs synchronously within API requests.

- **Concurrent request handling:** Multiple repair requests may arrive simultaneously, requiring the system to process them safely and efficiently.

- **Inconsistent records:** Without persistent storage, request details and status history may be lost or become inconsistent after failures or restarts.

- **Difficult monitoring:** Supervisors may struggle to search, filter, and monitor requests across different equipment types and statuses.

## 2. Business Objectives

- **Objective 1: Centralized Repair Request Management** — Provide a centralized platform for submitting, organizing, viewing, and tracking IT equipment repair requests.

- **Objective 2: Real-Time Operational Visibility** — Enable operators and supervisors to monitor repair-request status and processing progress through automatically delivered live updates.

- **Objective 3: Concurrent and Responsive Processing** — Support multiple repair requests being processed concurrently through background execution without blocking ordinary application requests.

- **Objective 4: Reliable Request Records** — Maintain persistent equipment, request, status, timestamp, and processing information so that previously submitted requests remain available after page refreshes or application restarts.

## 3. Users

### 3.1 Operator

The operator is responsible for submitting and tracking IT equipment repair requests.

Responsibilities and capabilities:

- Submit repair requests with equipment information and reported issues.
- View submitted repair requests and their current statuses.
- Open individual requests to view equipment details, progress, and available results or error information.
- Search and filter repair requests.
- Request cancellation of eligible repair requests.
- Receive live updates about relevant request-status changes.

### 3.2 Supervisor

The supervisor oversees repair-request processing and operational activities.

Responsibilities and capabilities:

- View all repair requests.
- Monitor pending, processing, completed, failed, and cancelled requests.
- Inspect individual requests and their equipment information.
- Monitor processing progress and identify requests requiring attention.
- Perform permitted status-management and cancellation actions.
- Receive real-time updates about request creation and processing changes.

**MVP assumption:** Operator and supervisor responsibilities will be represented in the application's interface and permitted actions. A complete authentication system, user registration workflow, and production-grade identity management are not mandatory for the initial MVP.

## 4. Assumptions

- **Assumption 1: Web-Based Access** — The system will be accessed through a web browser on desktop, tablet, or mobile devices.

- **Assumption 2: User Roles** — Operators and supervisors have different responsibilities and permitted actions. Full authentication and production-grade role-based access control are outside the initial MVP scope.

- **Assumption 3: Domain-Specific Requests** — Each service request represents one IT equipment repair or servicing issue involving a laptop, desktop computer, server, or networking device.

- **Assumption 4: Required Equipment Information** — A repair request contains a unique request identifier, equipment category, device model or identification information where available, a description of the reported issue, a creation timestamp, and a status.

- **Assumption 5: Initial Status** — Every successfully created repair request begins in the `PENDING` state.

- **Assumption 6: Defined Request Lifecycle** — Requests may transition through `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, and `CANCELLED`, subject to defined transition rules.

- **Assumption 7: Simulated Repair Processing** — The MVP will simulate repair-processing operations using background tasks. It will not perform physical repairs, communicate with actual technicians, or integrate with external repair providers.

- **Assumption 8: Concurrent Execution** — Multiple repair requests may be processed concurrently using a configured background worker mechanism.

- **Assumption 9: Real-Time Communication** — Connected clients will receive request updates through WebSockets. REST APIs will provide initial data loading and recovery or resynchronization when needed.

- **Assumption 10: Persistent Storage** — Request information will be stored in a relational database and remain available after browser refreshes or application restarts.

- **Assumption 11: Cancellation Rules** — Requests may be cancelled only when their current states permit cancellation. Completed, failed, and already cancelled requests cannot be cancelled again.

- **Assumption 12: Processing Recovery** — If an application or worker interruption occurs, persisted requests will remain available. The system will identify requests that were pending or processing at the time of interruption; automatic resumption of interrupted operations is outside the initial MVP scope.

## 5. Scope

### 5.1 In Scope

The initial MVP will include:

- A responsive web interface for managing IT equipment repair requests.
- A repair-request submission form containing equipment category, device model or identification information where available, and reported issue details.
- Unique request identifiers and timestamps.
- A dashboard displaying repair requests and their current statuses.
- Individual request details, including equipment information, reported issues, processing state, and available results or error information.
- Request lifecycle management with permitted status transitions.
- Cancellation of eligible requests.
- Search by request identifier and filtering by status or submission date.
- REST APIs for creating, retrieving, and managing repair requests.
- WebSocket-based live notifications for request creation, status changes, and cancellation.
- Concurrent background processing of simulated repair operations.
- Persistent storage of requests, timestamps, statuses, and available processing results.
- Input validation and consistent error handling.
- A layered backend architecture and modular frontend structure.
- Documentation, database design, API specifications, and setup instructions.
- Basic verification of simultaneous processing, persistence, and live updates.

### 5.2 Out of Scope

The initial MVP will not include:

- A multi-vendor marketplace or vendor registration portal.
- Vendor discovery, vendor selection, or automatic technician assignment.
- Real-world physical repair operations or integration with actual repair technicians.
- Customer quotations, invoicing, billing, or online payments.
- Equipment pickup and delivery logistics.
- Inventory, spare-parts, or warranty management.
- Integration with external CRM, ERP, or enterprise service-management platforms.
- Email, SMS, or third-party messaging notifications.
- Advanced analytics, predictive maintenance, or business intelligence reporting.
- Complex workflow configuration, automated prioritization, or SLA management.
- Native Android or iOS applications.
- Production-grade authentication and identity management.
- Distributed job queues, microservices, or large-scale cloud infrastructure unless time permits after the mandatory requirements are complete.

## 6. Functional Requirements

### FR-01: Create IT Equipment Repair Request

The system shall allow operators to submit repair requests by providing the equipment category, device model or identification information where available, and a description of the reported issue. Each successfully submitted request shall receive a unique identifier, a creation timestamp, and an initial status of `PENDING`.

**Stakeholders/Actors:** Operator, System.

### FR-02: View Repair Requests

The system shall allow operators to view their submitted repair requests and supervisors to view all repair requests. The request list shall display essential information, including request ID, equipment category, reported issue, submission time, and current status.

**Stakeholders/Actors:** Operator, Supervisor.

### FR-03: View Repair Request Details

The system shall allow authorized users to open a repair request and view its complete available information, including equipment category, device model or identification details, reported issue, current status, processing progress, timestamps, and available results or error information.

**Stakeholders/Actors:** Operator, Supervisor.

### FR-04: Update Repair Request Status

The system shall update request statuses as they move through the processing lifecycle: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, or `CANCELLED`. The system shall enforce permitted status transitions and prevent invalid transitions, such as marking a request completed before processing has finished. Supervisors may perform explicitly permitted status-management actions.

**Stakeholders/Actors:** System, Supervisor.

### FR-05: Monitor Repair Progress

The system shall display the current processing state and available progress information for active repair requests. Operators and supervisors shall be able to distinguish pending, processing, completed, failed, and cancelled requests.

**Stakeholders/Actors:** Operator, Supervisor, System.

### FR-06: Receive Real-Time Updates

The system shall use WebSocket communication to automatically notify connected clients when a repair request is created, its status or progress changes, or it is cancelled. The frontend shall update the relevant request information without requiring manual page refreshes or relying on polling as the primary update mechanism.

**Stakeholders/Actors:** Operator, Supervisor, System.

### FR-07: Cancel Repair Request

The system shall allow an operator or supervisor to request cancellation of a repair request when its current state permits cancellation. The system shall prevent cancellation from incorrectly overwriting a completed, failed, or already cancelled state and shall ensure that a queued request cancelled before processing does not subsequently begin processing.

**Stakeholders/Actors:** Operator, Supervisor, System.

### FR-08: Search and Filter Repair Requests

The system shall allow users to search for repair requests by their unique identifier and filter request lists by relevant criteria, including status and submission date. Search and filtering shall operate on persisted repair-request data.

**Stakeholders/Actors:** Operator, Supervisor.

### FR-09: Concurrent Background Processing

The system shall execute simulated repair-processing operations through background workers so that users can continue submitting requests and interacting with the application while processing continues. The system shall support multiple requests being processed concurrently and update each request's status as processing progresses or fails.

**Stakeholders/Actors:** System, Operator, Supervisor.

### FR-10: Persist Repair Request Data

The system shall store repair-request information, equipment details, statuses, timestamps, and available processing results in a persistent database. Previously submitted requests shall remain retrievable after browser refreshes and application restarts.

**Stakeholders/Actors:** System, Operator, Supervisor.

### FR-11: Validate Input and Handle Failures

The system shall validate required request information and reject invalid submissions with understandable error messages. It shall handle nonexistent request identifiers, invalid status transitions, and processing failures consistently. If a background operation fails, the system shall record the failure, set the request status to `FAILED` where appropriate, and publish a corresponding live update to connected clients.

**Stakeholders/Actors:** Operator, Supervisor, System.

### FR-12: Identify Interrupted Processing

After an application restart, the system shall allow previously persisted repair requests to be retrieved and shall identify requests that were pending or processing when the interruption occurred. The initial MVP is not required to resume interrupted operations automatically.

**Stakeholders/Actors:** System, Operator, Supervisor.

## 7. Non-Functional Requirements

### NFR-01: Performance

The system shall respond promptly to ordinary operations, including request submission, retrieval, and filtering. Long-running simulated repair operations shall execute outside the request-handling path so that they do not block ordinary API requests.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

### NFR-02: Concurrency and Data Consistency

The system shall support multiple repair requests being processed concurrently without unintended interference between independent requests. Concurrent status changes and cancellation attempts shall be handled using appropriate synchronization or database consistency mechanisms to prevent invalid transitions and inconsistent records.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

### NFR-03: Reliability

The system shall maintain accurate persisted request information and enforce valid request-state transitions throughout the processing lifecycle. Failures shall be recorded explicitly rather than silently losing requests or incorrectly reporting unsuccessful operations as completed.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

### NFR-04: Security and Input Validation

The system shall validate incoming data, handle errors safely, and separate operator and supervisor responsibilities in its application design. Unauthorized actions and access to information outside a user's permitted scope should be prevented. Full authentication and production-grade access control are deferred from the initial MVP.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

### NFR-05: Maintainability

The backend shall use a layered architecture that separates controllers, business logic, data access, and background processing. The frontend shall use reusable components and a clear separation between presentation and API communication. Meaningful naming, version control, and documentation shall support testing, troubleshooting, and future modifications.

**Stakeholders/Actors:** Developers, System Administrator, Organization.

### NFR-06: Availability and Recovery

The system shall preserve persisted repair-request records during application or worker interruptions. After recovery, previously stored requests shall remain retrievable, and requests interrupted during processing shall be identifiable. Automatic resumption of interrupted operations is not required for the initial MVP.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

### NFR-07: Usability and Responsiveness

The system shall provide a clear interface that allows operators to submit repair requests and supervisors to monitor processing efficiently. The interface shall adapt to common desktop, tablet, and mobile screen sizes and remain responsive while background processing continues.

**Stakeholders/Actors:** Operator, Supervisor.

### NFR-08: Scalability

The system shall use a modular architecture and a configurable background worker pool so that processing concurrency and resource usage can be adjusted as workload increases. The initial implementation will target a single application deployment and will not require distributed processing infrastructure.

**Stakeholders/Actors:** Developers, System Administrator, Organization.

## 8. Acceptance Criteria

The MVP will be considered functionally complete when the following scenarios can be demonstrated:

1. An operator submits an IT equipment repair request and receives a unique request ID.
2. The request is saved in the database with its equipment information and initial `PENDING` status.
3. A background worker processes the request without blocking new API requests.
4. Multiple repair requests can be processed concurrently.
5. A connected client receives WebSocket notifications when request statuses change, without requiring manual refreshes.
6. An eligible request can be cancelled without allowing an invalid status transition.
7. Users can retrieve requests, search by request ID, and filter by status or submission date.
8. Invalid submissions and processing failures produce appropriate error responses and persisted status information.
9. Previously stored requests remain available after an application restart.
10. The application can be configured, started, and tested using the instructions in the README.

These criteria demonstrate the mandatory assignment requirements while keeping the implementation focused on an achievable IT repair-service use case.
