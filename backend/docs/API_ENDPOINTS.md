# Task and Milestone API Endpoints Documentation

## Task Endpoints

### 1. GET /api/tasks
**Description**: Get all tasks for the authenticated user.

**Authentication**: Required (JWT Token)

**Request**:
- Headers:
  ```
  Authorization: Bearer <token>
  ```
- No body required

**Response**:
- Status Code: 200 OK
- Content-Type: application/json
- Body:
  ```typescript
  {
    [
      {
        id: string;
        title: string;
        description: string;
        userId: string;
        createdAt: string; // ISO format date
        updatedAt: string; // ISO format date
        milestones: [
          {
            id: string;
            title: string;
            description: string;
            taskId: string;
            isComplete: boolean;
            deadline: string; // ISO format date
            createdAt: string; // ISO format date
            updatedAt: string; // ISO format date
          }
        ]
      }
    ]
  }
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message
  }
  ```
- 401 Unauthorized (if token is invalid)

### 2. POST /api/tasks
**Description**: Create a new task for the authenticated user.

**Authentication**: Required (JWT Token)

**Request**:
- Headers:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- Body:
  ```typescript
  {
    title: string;       // Required
    description: string; // Optional
  }
  ```

**Response**:
- Status Code: 201 Created
- Content-Type: application/json
- Body:
  ```typescript
  {
    id: string;
    title: string;
    description: string;
    userId: string;
    createdAt: string; // ISO format date
    updatedAt: string; // ISO format date
  }
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Title is required"
  }
  ```
- 401 Unauthorized (if token is invalid)

### 3. PUT /api/tasks/:taskId
**Description**: Update an existing task.

**Authentication**: Required (JWT Token)

**Request**:
- Path Parameters:
  - taskId: string (UUID of the task)
- Headers:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- Body:
  ```typescript
  {
    title?: string;       // Optional
    description?: string; // Optional
  }
  ```

**Response**:
- Status Code: 200 OK
- Content-Type: application/json
- Body:
  ```typescript
  {
    id: string;
    title: string;
    description: string;
    userId: string;
    createdAt: string; // ISO format date
    updatedAt: string; // ISO format date
  }
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Task not found" or "No fields provided for update"
  }
  ```
- 401 Unauthorized (if token is invalid)

### 4. DELETE /api/tasks/:taskId
**Description**: Delete an existing task and all its milestones (cascade delete).

**Authentication**: Required (JWT Token)

**Request**:
- Path Parameters:
  - taskId: string (UUID of the task)
- Headers:
  ```
  Authorization: Bearer <token>
  ```
- No body required

**Response**:
- Status Code: 204 No Content (success, no body returned)

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Task not found"
  }
  ```
- 401 Unauthorized (if token is invalid)

## Milestone Endpoints

### 1. GET /api/milestones/:taskId
**Description**: Get all milestones for a specific task.

**Authentication**: Required (JWT Token)

**Request**:
- Path Parameters:
  - taskId: string (UUID of the task)
- Headers:
  ```
  Authorization: Bearer <token>
  ```
- No body required

**Response**:
- Status Code: 200 OK
- Content-Type: application/json
- Body:
  ```typescript
  [
    {
      id: string;
      title: string;
      description: string;
      taskId: string;
      isComplete: boolean;
      deadline: string; // ISO format date
      createdAt: string; // ISO format date
      updatedAt: string; // ISO format date
    }
  ]
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Task ID is required" or "Error fetching milestones"
  }
  ```
- 401 Unauthorized (if token is invalid)

### 2. POST /api/milestones
**Description**: Create a new milestone for a specific task.

**Authentication**: Required (JWT Token)

**Request**:
- Headers:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- Body:
  ```typescript
  {
    title: string;       // Required
    description: string; // Required
    deadline: string;    // Required (date string in ISO format or YYYY-MM-DD)
    taskId: string;      // Required (UUID of the task)
  }
  ```

**Response**:
- Status Code: 201 Created
- Content-Type: application/json
- Body:
  ```typescript
  {
    id: string;
    title: string;
    description: string;
    taskId: string;
    isComplete: boolean; // Default: false
    deadline: string;    // ISO format date
    createdAt: string;   // ISO format date
    updatedAt: string;   // ISO format date
  }
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Missing required fields: title, description, deadline, taskId"
  }
  ```
- 401 Unauthorized (if token is invalid)

### 3. PUT /api/milestones/:milestoneId
**Description**: Update an existing milestone.

**Authentication**: Required (JWT Token)

**Request**:
- Path Parameters:
  - milestoneId: string (UUID of the milestone)
- Headers:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- Body:
  ```typescript
  {
    title?: string;       // Optional
    description?: string; // Optional
    deadline?: string;    // Optional (date string in ISO format or YYYY-MM-DD)
    isComplete?: boolean; // Optional
  }
  ```

**Response**:
- Status Code: 200 OK
- Content-Type: application/json
- Body:
  ```typescript
  {
    id: string;
    title: string;
    description: string;
    taskId: string;
    isComplete: boolean;
    deadline: string;    // ISO format date
    createdAt: string;   // ISO format date
    updatedAt: string;   // ISO format date
  }
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Milestone not found" or "No fields provided for update"
  }
  ```
- 401 Unauthorized (if token is invalid)

### 4. DELETE /api/milestones/:milestoneId
**Description**: Delete an existing milestone.

**Authentication**: Required (JWT Token)

**Request**:
- Path Parameters:
  - milestoneId: string (UUID of the milestone)
- Headers:
  ```
  Authorization: Bearer <token>
  ```
- No body required

**Response**:
- Status Code: 200 OK
- Content-Type: application/json
- Body:
  ```typescript
  {
    id: string;
    title: string;
    description: string;
    taskId: string;
    isComplete: boolean;
    deadline: string;    // ISO format date
    createdAt: string;   // ISO format date
    updatedAt: string;   // ISO format date
  }
  ```

**Error Responses**:
- 400 Bad Request
  ```typescript
  {
    error: string; // Error message, e.g., "Milestone not found" or "Error deleting milestone"
  }
  ```
- 401 Unauthorized (if token is invalid)

## Authentication

All endpoints require authentication using a JWT token provided in the Authorization header:
```
Authorization: Bearer <token>
```

The token can be obtained by logging in through the authentication endpoints (not covered in this document).

## Error Handling

All endpoints return appropriate HTTP status codes with JSON error responses:

```typescript
{
  error: string; // A descriptive error message
}
```

Common status codes:
- 200/201: Successful operation
- 204: Successful deletion (no content)
- 400: Bad request (validation error, resource not found)
- 401: Unauthorized (invalid or missing token)
- 500: Server error (rare, only occurs for unexpected issues)

## Data Models

### Task
```typescript
{
  id: string;           // UUID
  title: string;        // Task title
  description: string;  // Task description
  userId: string;       // UUID of the user who created the task
  createdAt: string;    // ISO format date
  updatedAt: string;    // ISO format date
  milestones?: Milestone[]; // Optional array of related milestones
}
```

### Milestone
```typescript
{
  id: string;           // UUID
  title: string;        // Milestone title
  description: string;  // Milestone description
  taskId: string;       // UUID of the parent task
  isComplete: boolean;  // Whether the milestone is complete
  deadline: string;     // ISO format date for the milestone's deadline
  createdAt: string;    // ISO format date
  updatedAt: string;    // ISO format date
}
```
