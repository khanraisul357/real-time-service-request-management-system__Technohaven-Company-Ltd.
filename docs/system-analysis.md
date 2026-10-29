# System Analysis

## 1. Problem Statement

- The organization currently manages customer service requests manually.
- leading to delayed status updates.
- limited visibility into request progress.
- Inefficient coordination between operators and supervisors. 
- anual processing also makes it difficult to handle multiple requests simultaneously and monitor ongoing operations effectively.

The organization needs a centralized, web-based Service Request Management System that allows operators to submit and track service requests while supervisors monitor processing and status changes in real time. 
The system should support concurrent request processing, execute long-running operations in the background, and provide live updates to connected users without requiring them to refresh the page.

## 2. Business Objectives

- **Objective 1:** Provide a centralized platform for submitting, organizing, and tracking service requests efficiently.
- **Objective 2:** Allow supervisors and operators to view live request status updates and monitor processing progress.
- **Objective 3:** Handle multiple service requests concurrently and execute long-running tasks in the background while keeping the application responsive.

## 3. Users

- **Operator:**
  - Can receive new service request.
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
### Out of Scope
- Integration with external customer relationship management (CRM), billing, or enterprise resource planning (ERP) systems.
- Email, SMS, or third-party messaging notifications.
- Advanced analytics, business intelligence reports, and predictive insights.
- Complex workflow configuration, automatic request prioritization, and service-level agreement (SLA) management.
- Native Android or iOS mobile applications.


