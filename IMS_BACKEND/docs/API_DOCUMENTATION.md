# IMS Backend API Documentation

## Base URL
All admin endpoints are prefixed with `/api/v1/users/`

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Search & Filtering](#search--filtering)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Response Formats](#response-formats)

---

## Authentication

All API endpoints use JWT-based authentication with HTTP-only cookies for security.

### Login Process
1. User submits credentials to `/api/v1/users/login`
2. Server validates credentials and generates JWT token
3. Token is stored in secure HTTP-only cookie
4. Subsequent requests automatically include the cookie

### Authentication Headers
```
Cookie: token=<jwt_token>
```

### Role-Based Access
- **Public**: No authentication required
- **Authenticated**: Valid JWT token required
- **Admin**: Admin role required

---

## User Management

### User Registration
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "RoleName": "student",
      "level": 15
    },
    "status": "active"
  }
}
```

### User Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Password Reset
```http
POST /api/v1/users/password/forgot
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

## Search & Filtering

### Basic User Search
```http
GET /api/v1/users?search=john&page=1&limit=10
```

### Advanced Filtering
```http
GET /api/v1/users?status=active&role=student&createdFrom=2024-01-01&sortBy=createdAt&sortOrder=desc
```

### Quick Search (Autocomplete)
```http
GET /api/v1/users/quick-search?q=joh&limit=5
```

### Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (max: 100) | `limit=20` |
| `search` | string | Global search term | `search=john` |
| `name` | string | Search by name | `name=john` |
| `email` | string | Search by email | `email=gmail.com` |
| `status` | string | Filter by status | `status=active` |
| `role` | string | Filter by role | `role=admin` |
| `createdFrom` | date | Created after date | `createdFrom=2024-01-01` |
| `createdTo` | date | Created before date | `createdTo=2024-12-31` |
| `lastLoginFrom` | date | Last login after | `lastLoginFrom=2024-01-01` |
| `lastLoginTo` | date | Last login before | `lastLoginTo=2024-12-31` |
| `loginAttempts` | number | Min login attempts | `loginAttempts=3` |
| `locked` | boolean | Account lock status | `locked=true` |
| `sortBy` | string | Sort field | `sortBy=createdAt` |
| `sortOrder` | string | Sort direction | `sortOrder=desc` |

### Sort Fields
- `name` - User name
- `email` - Email address
- `createdAt` - Creation date
- `updatedAt` - Last update date
- `lastLogin` - Last login date
- `status` - Account status
- `loginAttempts` - Failed login attempts

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

### Common Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `400` | Bad Request | Invalid parameters, validation errors |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate email, username conflicts |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side errors |

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Rate Limiting

### Default Limits
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Search endpoints**: 100 requests per 15 minutes per user
- **General API**: 1000 requests per 15 minutes per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 900
}
```

---

## Response Formats

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "filters": {
    "applied": { "status": "active" },
    "search": "john",
    "status": "active",
    "role": "student"
  },
  "sort": { "createdAt": -1 }
}
```

### User Object
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active",
  "role": {
    "_id": "role_id",
    "RoleName": "student",
    "description": "Default student role",
    "level": 15
  },
  "avatar": {
    "public_id": "avatar_id",
    "url": "https://example.com/avatar.jpg"
  },
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "loginAttempts": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Statistics Response
```json
{
  "success": true,
  "stats": {
    "total": 1000,
    "active": 850,
    "locked": 15,
    "byStatus": [
      { "_id": "active", "count": 850 },
      { "_id": "inactive", "count": 100 },
      { "_id": "suspended", "count": 35 },
      { "_id": "pending", "count": 15 }
    ],
    "byRole": [
      { "_id": "student", "count": 800 },
      { "_id": "admin", "count": 200 }
    ]
  }
}
```

---

## Best Practices

### 1. Pagination
- Always use pagination for list endpoints
- Keep page size reasonable (10-50 items)
- Use `hasNextPage` and `hasPrevPage` for navigation

### 2. Search Performance
- Use specific field searches when possible
- Implement debouncing for real-time search
- Cache frequently accessed results

### 3. Error Handling
- Always check the `success` field
- Display user-friendly error messages
- Log detailed errors for debugging

### 4. Security
- Never expose sensitive data in responses
- Validate all input parameters
- Use HTTPS in production

### 5. Rate Limiting
- Implement exponential backoff for retries
- Monitor rate limit headers
- Cache responses when appropriate

---

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true // Include cookies
});

// Search users
const searchUsers = async (params) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error.response.data);
    throw error;
  }
};

// Usage
const results = await searchUsers({
  search: 'john',
  status: 'active',
  page: 1,
  limit: 20
});
```

### Python
```python
import requests

class IMSClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def search_users(self, **params):
        response = self.session.get(
            f"{self.base_url}/users",
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage
client = IMSClient('http://localhost:4000/api/v1')
results = client.search_users(
    search='john',
    status='active',
    page=1,
    limit=20
)
```

---

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
npm run test:api
```

### Load Testing
```bash
npm run test:load
```

---

For more detailed examples and interactive testing, visit the Swagger documentation at `http://localhost:4000` when the server is running.
