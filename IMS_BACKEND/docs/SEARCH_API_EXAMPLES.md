# User Search API Examples

This document provides comprehensive examples of how to use the user search and filtering API endpoints.

## Base URL
All endpoints are prefixed with `/api/v1/users/admin/`

## Authentication
All search endpoints require admin authentication via cookies. Make sure you're logged in as an admin user.

## 1. Basic User Listing with Pagination

### Get first page with 10 users
```bash
GET /api/v1/users/admin/users?page=1&limit=10
```

### Get second page with 20 users
```bash
GET /api/v1/users/admin/users?page=2&limit=20
```

## 2. Search Examples

### Global search across name and email
```bash
GET /api/v1/users/admin/users?search=john
```

### Search by specific name
```bash
GET /api/v1/users/admin/users?name=john
```

### Search by email
```bash
GET /api/v1/users/admin/users?email=gmail.com
```

## 3. Filtering Examples

### Filter by status
```bash
# Active users only
GET /api/v1/users/admin/users?status=active

# Suspended users
GET /api/v1/users/admin/users?status=suspended

# Inactive users
GET /api/v1/users/admin/users?status=inactive
```

### Filter by role
```bash
# Filter by role name
GET /api/v1/users/admin/users?role=admin

# Filter by role name (case insensitive)
GET /api/v1/users/admin/users?role=student
```

### Filter by date ranges
```bash
# Users created in 2024
GET /api/v1/users/admin/users?createdFrom=2024-01-01&createdTo=2024-12-31

# Users who logged in this month
GET /api/v1/users/admin/users?lastLoginFrom=2024-12-01&lastLoginTo=2024-12-31

# Users created in the last 30 days
GET /api/v1/users/admin/users?createdFrom=2024-11-01
```

### Filter by login attempts and locked status
```bash
# Users with failed login attempts
GET /api/v1/users/admin/users?loginAttempts=1

# Currently locked users
GET /api/v1/users/admin/users?locked=true

# Unlocked users
GET /api/v1/users/admin/users?locked=false
```

## 4. Sorting Examples

### Sort by creation date (newest first)
```bash
GET /api/v1/users/admin/users?sortBy=createdAt&sortOrder=desc
```

### Sort by name (alphabetical)
```bash
GET /api/v1/users/admin/users?sortBy=name&sortOrder=asc
```

### Sort by last login (most recent first)
```bash
GET /api/v1/users/admin/users?sortBy=lastLogin&sortOrder=desc
```

## 5. Combined Filtering Examples

### Active students created this year
```bash
GET /api/v1/users/admin/users?status=active&role=student&createdFrom=2024-01-01
```

### Search for admins with failed login attempts
```bash
GET /api/v1/users/admin/users?search=admin&role=admin&loginAttempts=1
```

### Suspended users sorted by creation date
```bash
GET /api/v1/users/admin/users?status=suspended&sortBy=createdAt&sortOrder=desc&page=1&limit=50
```

## 6. Advanced Search Examples

### Advanced search endpoint
```bash
# Search with complex criteria
GET /api/v1/users/admin/search?query=john&status=active&role=student

# Find users with login attempts but not locked
GET /api/v1/users/admin/search?hasLoginAttempts=true&isLocked=false

# Find users who never logged in
GET /api/v1/users/admin/search?hasNeverLoggedIn=true&status=active
```

## 7. Quick Search for Autocomplete

### Quick search for user suggestions
```bash
GET /api/v1/users/admin/quick-search?q=joh&limit=5
```

### Get search suggestions for names
```bash
GET /api/v1/users/admin/suggestions?field=name&term=joh&limit=10
```

### Get search suggestions for emails
```bash
GET /api/v1/users/admin/suggestions?field=email&term=gmail&limit=10
```

## 8. User Statistics

### Get comprehensive user statistics
```bash
GET /api/v1/users/admin/stats
```

## 9. User Management Actions

### Update user status
```bash
PUT /api/v1/users/admin/user/{userId}/status
Content-Type: application/json

{
  "status": "suspended"
}
```

### Unlock user account
```bash
PUT /api/v1/users/admin/user/{userId}/unlock
```

## 10. Response Examples

### Paginated User List Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "role": {
        "_id": "role_id",
        "RoleName": "student",
        "description": "Student role",
        "level": 15
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "loginAttempts": 0
    }
  ],
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

### Quick Search Response
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": { "url": "avatar_url" },
      "role": "student"
    }
  ],
  "query": "joh"
}
```

### User Statistics Response
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

## Frontend Integration Tips

1. **Debounce search inputs** to avoid too many API calls
2. **Use quick search** for autocomplete features
3. **Implement infinite scroll** or pagination for large datasets
4. **Cache search results** when appropriate
5. **Show loading states** during search operations
6. **Handle empty results** gracefully
7. **Use URL parameters** to make searches bookmarkable

## Performance Considerations

1. **Limit page size** to reasonable numbers (10-50 items)
2. **Use specific field searches** instead of global search when possible
3. **Implement client-side caching** for frequently accessed data
4. **Consider using indexes** on frequently searched fields
5. **Monitor search performance** and optimize slow queries
