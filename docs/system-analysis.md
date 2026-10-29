# System Analysis

## 1. Problem Statement

- The organization currently manages customer service requests manually.
- leading to delayed status updates.
- limited visibility into request progress.
- Inefficient coordination between operators and supervisors. 
- Manual processing also makes it difficult to handle multiple requests simultaneously and monitor ongoing operations effectively.

The organization needs a centralized, web-based Service Request Management System that allows operators to submit and track service requests while supervisors monitor processing and status changes in real time. 
The system should support concurrent request processing, execute long-running operations in the background, and provide live updates to connected users without requiring them to refresh the page.

## 2. Business Objectives

- **Objective 1:** Provide a centralized platform for submitting, organizing, and tracking service requests efficiently.
- **Objective 2:** Allow supervisors and operators to view live request status updates and monitor processing progress.
- **Objective 3:** Handle multiple service requests concurrently and execute long-running tasks in the background while keeping the application responsive.

## 3. Users

- **Operator:**
  - Can submit new service requests.
  - Can view submitted requests.
  - Can track their current status.
  - Can monitor processing progress.
- **Supervisor:** 
  - Can view all service requests.
  - Can monitor their status and progress in real time.
  - Can identify pending or delayed requests.
  - Can oversee overall processing activities.

## 4. Assumptions

- **Assumption 1:** The system will be accessed through a web browser, and users will have a stable internet connection.
- **Assumption 2:** Operators and supervisors will have different access permissions based on their roles.
- **Assumption 3:** Each service request will have a unique identifier, a description, a creation timestamp, and a status such as Pending, Processing, Completed, or Failed.
- **Assumption 4:** Long-running operations will execute asynchronously in the background, allowing users to continue interacting with the application.
- **Assumption 5:** Real-time status updates will be delivered to connected users automatically without requiring manual page refreshes.

## 5. Scope

### In Scope
- User interface for submitting service requests and viewing request details.
- Request listing with unique IDs, creation times, and current statuses.
- Real-time status and progress updates for connected users.
- Background processing of long-running service requests.
- Concurrent processing of multiple requests without blocking the main application.
- Supervisor dashboard for monitoring all requests and their processing progress.
- Persistent storage of request information and processing results.
- Basic error handling for failed operations.
- Updating request status.
- Cancelling eligible requests
- Searching and filtering requests.


### Out of Scope
- Integration with external customer relationship management (CRM), billing, or enterprise resource planning (ERP) systems.
- Email, SMS, or third-party messaging notifications.
- Advanced analytics, business intelligence reports, and predictive insights.
- Complex workflow configuration, automatic request prioritization, and service-level agreement (SLA) management.
- Native Android or iOS mobile applications.

### 6. Functional Requirements

- **FR-01: Create Service Request —** The system shall allow operators to submit new service requests by providing the required information. Each successfully submitted request shall receive a unique identifier and an initial status of Pending.

**Stakeholders/Actors:** Operator.

- **FR-02: View Service Requests —** The system shall allow operators to view their submitted requests and supervisors to view all service requests. The request list shall display essential information, including the request ID, submission time, and current status.

**Stakeholders/Actors:** Operator, Supervisor.

- **FR-03: View Request Details —** The system shall allow authorized users to open a service request and view its complete details, current status, processing progress, and available results or error information. Users shall only be able to access information permitted by their roles.

**Stakeholders/Actors:** Operator, Supervisor.

- **FR-04: Update Request Status —** The system shall automatically update request statuses as they move through the processing lifecycle: Pending, Processing, Completed, Failed, or Cancelled. Supervisors may perform permitted status-management actions, subject to defined workflow rules. The system shall prevent invalid status transitions, such as marking a request Completed before its processing has finished.

**Stakeholders/Actors:** System, Supervisor.

- **FR-05: Monitor Request Progress —** The system shall display the current processing state and progress information for active requests whenever such information is available. Supervisors and operators shall be able to identify pending, ongoing, completed, and failed requests.

**Stakeholders/Actors:** Operator, Supervisor, System.

- **FR-06: Receive Live Updates —** The system shall preserve previously stored request data if the application or a background worker stops unexpectedly. After restarting, the system shall allow users to retrieve stored requests and identify requests that were still pending or processing when the interruption occurred. Automatic resumption of interrupted operations is outside the initial MVP scope.

**Stakeholders/Actors:** Operator, Supervisor, System.

- **FR-07: Cancel Service Request —** The system shall allow an authorized operator or supervisor to request cancellation of a service request when its current state permits cancellation. The system shall update the request status accordingly and prevent a cancellation request from incorrectly overwriting a completed or otherwise non-cancellable state.

**Stakeholders/Actors:** Operator, Supervisor, System.

- **FR-08: Search and Filter Requests —** The system shall allow users to search for requests by their unique identifier and filter request lists by relevant criteria, such as status and submission date. The results shall respect each user's access permissions.

**Stakeholders/Actors:** Operator, Supervisor.

- **FR-09: Background Processing —** The system shall execute long-running service request operations in the background so that users can continue submitting requests and interacting with the application while processing continues. Users shall be able to monitor the status of these operations until they complete or fail.

**Stakeholders/Actors:** System, Operator, Supervisor.

- **FR-10: Persist Request Data —** The system shall store service request information, status changes, timestamps, and available processing results so that the information remains available after a page refresh or application restart. Authorized users shall be able to retrieve previously submitted requests.

**Stakeholders/Actors:** System, Operator, Supervisor.

- **FR-11: Handle Invalid Requests and Failures —** The system shall validate submitted information and provide understandable error messages when requests contain invalid data or cannot be processed. If a background operation fails, the system shall record the failure, update the request status appropriately, and inform relevant connected users.

**Stakeholders/Actors:** Operator, Supervisor, System.

### 7. Non-Functional Requirements

- **NFR-01: Performance —** The system shall respond promptly to normal user interactions, including request submission, request retrieval, and filtering. Long-running operations shall not cause ordinary API requests or user-interface interactions to become unresponsive.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

- **NFR-02: Concurrency —** The system shall support multiple service requests being processed concurrently without causing incorrect status updates, data corruption, or interference between independent requests. It shall maintain consistent request information when multiple users interact with the system simultaneously.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

- **NFR-03: Reliability —** The system shall process requests consistently and maintain accurate status information throughout their lifecycle. Processing failures shall be handled without silently losing request records or incorrectly reporting failed operations as completed.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

- **NFR-04: Security and Validation —** The system shall enforce role-based access permissions and validate all incoming data before accepting or processing requests. Sensitive information shall be protected against unauthorized access, and users shall not be able to perform actions outside their assigned permissions.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

- **NFR-05: Maintainability —** The system shall follow a clear, modular architecture with separate responsibilities for user interfaces, business logic, data access, and background processing. This separation shall make it easier for developers to test, troubleshoot, modify, and extend the application without unnecessarily affecting unrelated components.

**Stakeholders/Actors:** Developers, System Administrator, Organization.

- **NFR-06: Availability and Recovery —** The system shall be designed to recover from application or worker interruptions with minimal disruption to stored request data. After recovery, it shall preserve previously recorded requests and accurately identify operations that remain pending, require resumption, or have failed.

**Stakeholders/Actors:** Operator, Supervisor, System Administrator.

- **NFR-07: Usability and Responsiveness —** The system shall provide a clear and consistent interface that allows operators to submit requests and supervisors to monitor processing with minimal effort. The interface shall adapt to common desktop, tablet, and mobile screen sizes and remain usable while background operations are running.

**Stakeholders/Actors:** Operator, Supervisor.

- **NFR-08: Scalability —** The system shall use a design that can accommodate increasing request volumes and numbers of concurrent users by allowing processing capacity and application resources to be increased as needed. Background workers and request-handling components should be capable of being scaled or tuned independently where practical, without requiring a complete redesign.

**Stakeholders/Actors:** System Administrator, Developers, Organization, Operator, Supervisor.
