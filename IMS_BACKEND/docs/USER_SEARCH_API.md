# User Search and Filtering API Documentation

This document describes the comprehensive search and filtering capabilities for the user management system.

## Endpoints

### 1. Get All Users with Pagination and Filtering
**GET** `/api/v1/users`

#### Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Global search across name and email
- `name` (string): Search by name (partial match)
- `email` (string): Search by email (partial match)
- `status` (string): Filter by status (active, inactive, suspended, pending)
- `role` (string): Filter by role name or ObjectId
- `createdFrom` (date): Filter users created after this date
- `createdTo` (date): Filter users created before this date
- `lastLoginFrom` (date): Filter users who logged in after this date
- `lastLoginTo` (date): Filter users who logged in before this date
- `loginAttempts` (number): Filter users with login attempts >= this number
- `locked` (boolean): Filter locked/unlocked accounts
- `sortBy` (string): Sort field (name, email, createdAt, updatedAt, lastLogin, status, loginAttempts)
- `sortOrder` (string): Sort order (asc, desc)

#### Example Requests:
```bash
# Basic pagination
GET /api/v1/users?page=1&limit=20

# Search by name
GET /api/v1/users?search=john&page=1&limit=10

# Filter by status and role
GET /api/v1/users?status=active&role=admin&sortBy=createdAt&sortOrder=desc

# Date range filtering
GET /api/v1/users?createdFrom=2024-01-01&createdTo=2024-12-31

# Complex filtering
GET /api/v1/users?search=john&status=active&role=student&locked=false&sortBy=lastLogin&sortOrder=desc
```

#### Response:
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
      "lastLogin": "2024-01-15T10:30:00.000Z"
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

### 2. Advanced User Search
**GET** `/api/v1/users/search`

#### Query Parameters:
All parameters from basic search plus:
- `query` (string): Global search term
- `hasLoginAttempts` (boolean): Filter users with/without login attempts
- `isLocked` (boolean): Filter locked/unlocked accounts
- `hasNeverLoggedIn` (boolean): Filter users who never logged in
- `roleLevel` (number): Filter by minimum role level

#### Example Requests:
```bash
# Search with complex criteria
GET /api/v1/users/search?query=john&hasLoginAttempts=true&isLocked=false

# Find users who never logged in
GET /api/v1/users/search?hasNeverLoggedIn=true&status=active

# Search by role level
GET /api/v1/users/search?roleLevel=50&status=active
```

### 3. Quick Search (Autocomplete)
**GET** `/api/v1/users/quick-search`

#### Query Parameters:
- `q` (string): Search term (minimum 2 characters)
- `limit` (number): Maximum results (default: 5)

#### Example Request:
```bash
GET /api/v1/users/quick-search?q=joh&limit=5
```

#### Response:
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

### 4. Search Suggestions
**GET** `/api/v1/users/suggestions`

#### Query Parameters:
- `field` (string): Field to search (name, email)
- `term` (string): Partial search term (minimum 2 characters)
- `limit` (number): Maximum suggestions (default: 10)

#### Example Request:
```bash
GET /api/v1/users/suggestions?field=name&term=joh&limit=10
```

#### Response:
```json
{
  "success": true,
  "data": ["John Doe", "Johnny Smith", "Johnson Brown"],
  "field": "name",
  "term": "joh"
}
```

### 5. Advanced Search with Aggregation
**GET** `/api/v1/users/advanced-search`

#### Query Parameters:
- All basic search parameters plus advanced aggregation features
- Returns computed fields like `isCurrentlyLocked`, `daysSinceLastLogin`

### 6. User Statistics
**GET** `/api/v1/users/stats`

#### Response:
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

### 7. Update User Status
**PUT** `/api/v1/users/:id/status`

#### Request Body:
```json
{
  "status": "suspended"
}
```

### 8. Unlock User Account
**PUT** `/api/v1/users/:id/unlock`

## Frontend Integration Examples

### React Component Example:
```javascript
// User search component
const UserSearch = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    page: 1,
    limit: 10
  });

  const searchUsers = async () => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/v1/users?${queryParams}`);
    const data = await response.json();
    
    setUsers(data.data);
    setPagination(data.pagination);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  useEffect(() => {
    searchUsers();
  }, [filters]);

  return (
    <div>
      {/* Search inputs */}
      <input 
        type="text" 
        placeholder="Search users..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
      />
      
      <select 
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
        <option value="pending">Pending</option>
      </select>

      {/* User list */}
      {users.map(user => (
        <div key={user._id}>
          {user.name} - {user.email} - {user.status}
        </div>
      ))}

      {/* Pagination */}
      <div>
        Page {pagination.page} of {pagination.totalPages}
        Total: {pagination.total} users
      </div>
    </div>
  );
};
```

## Performance Notes

1. **Indexing**: Ensure proper indexes on frequently searched fields:
   - `name` (text index)
   - `email` (unique index)
   - `status` (compound index with other fields)
   - `role` (reference index)
   - `createdAt` (date index)
   - `lastLogin` (date index)

2. **Pagination**: Always use pagination for large datasets. Maximum limit is 100 items per page.

3. **Search Optimization**: Use specific field searches instead of global search when possible for better performance.

4. **Caching**: Consider implementing Redis caching for frequently accessed search results.

## Security Considerations

1. All search endpoints require admin authentication
2. Sensitive fields (password, tokens) are automatically excluded from results
3. Search queries are logged for audit purposes
4. Rate limiting applies to all search endpoints
