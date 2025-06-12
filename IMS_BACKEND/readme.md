# IMS Backend Server

A comprehensive user authentication and management system built with Node.js, Express, and MongoDB. Features role-based access control, advanced search capabilities, and comprehensive user management tools.

## 🚀 Features

### 🔐 Authentication System
- **JWT-based authentication** with secure cookie storage
- **Role-based access control** with hierarchical permissions
- **Account security** with login attempt tracking and automatic lockout
- **Password management** with secure reset functionality

### 👥 User Management
- **Advanced user search** with multiple criteria
- **Comprehensive pagination** and filtering
- **Real-time user statistics** and analytics
- **Flexible user status management**
- **Role assignment** with permission inheritance

### 🔍 Search & Filtering
- **Global search** across name and email fields
- **Advanced filtering** by status, role, dates, and login history
- **Quick search** for autocomplete functionality
- **Search suggestions** for better user experience
- **Sorting** by multiple fields with ascending/descending order

---

## 📋 API Endpoints

### 🔐 Authentication Endpoints
| Method | Endpoint | Access | Permission | Description |
|--------|----------|--------|------------|-------------|
| `POST` | `/api/v1/users/register` | Public | None | User registration |
| `POST` | `/api/v1/users/login` | Public | None | User login |
| `GET` | `/api/v1/users/logout` | Authenticated | None | User logout |
| `POST` | `/api/v1/users/password/forgot` | Public | None | Request password reset |
| `PUT` | `/api/v1/users/password/reset/:token` | Public | None | Reset password with token |
| `PUT` | `/api/v1/users/password/change` | Authenticated | `profile.update` | Change password |

### 👤 User Profile Endpoints
| Method | Endpoint | Access | Permission | Description |
|--------|----------|--------|------------|-------------|
| `GET` | `/api/v1/users/me` | Authenticated | `profile.read` | Get current user profile |

### 🛠️ Admin User Management
| Method | Endpoint | Access | Permission | Description |
|--------|----------|--------|------------|-------------|
| `POST` | `/api/v1/users/admin/user` | Admin | `user.create` | **Create new user with role assignment** |
| `GET` | `/api/v1/users/admin/users` | Admin | `user.read` | **Get all users with pagination & filtering** |
| `GET` | `/api/v1/users/admin/user/:id` | Admin | `user.read` | Get specific user details |
| `PUT` | `/api/v1/users/admin/user/:id` | Admin | `user.update` | **Update user details (name, email, role, isActive, avatar)** |

---

## 🔍 Search & Filtering Features

### 📄 Pagination Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

### 🔎 Search Parameters
- `search` (string): Global search across name and email
- `name` (string): Search by name (partial match)
- `email` (string): Search by email (partial match)

### 🎛️ Filter Parameters
- `status` (string): Filter by status (`active`, `inactive`, `suspended`, `pending`)
- `role` (string): Filter by role name or ObjectId
- `createdFrom` (date): Users created after this date
- `createdTo` (date): Users created before this date
- `lastLoginFrom` (date): Users who logged in after this date
- `lastLoginTo` (date): Users who logged in before this date
- `loginAttempts` (number): Users with login attempts >= this number
- `locked` (boolean): Filter locked/unlocked accounts

### 📊 Sorting Parameters
- `sortBy` (string): Sort field (`name`, `email`, `createdAt`, `updatedAt`, `lastLogin`, `status`, `loginAttempts`)
- `sortOrder` (string): Sort order (`asc`, `desc`)

### 💡 Example Usage
```bash
# Basic pagination
GET /api/v1/users?page=1&limit=20

# Search active students
GET /api/v1/users?search=john&status=active&role=student

# Filter by date range with sorting
GET /api/v1/users?createdFrom=2024-01-01&sortBy=createdAt&sortOrder=desc

# Find locked accounts
GET /api/v1/users?locked=true&sortBy=loginAttempts&sortOrder=desc

# Quick search for autocomplete
GET /api/v1/users/quick-search?q=joh&limit=5
```

---

## 🏗️ System Architecture

### 🔐 Role-Based Access Control
- **Hierarchical roles** with permission inheritance
- **Module-wise permissions** (user, role, admin, etc.)
- **Action-based permissions** (create, read, update, delete, export, import)
- **User-specific permissions** (additional/denied permissions)

### 🎯 Default Roles
- **Admin**: Full system access with all permissions
- **Student**: Default role with read-only permissions and profile management

### 🔒 Security Features
- **Account lockout** after 5 failed login attempts
- **JWT token** authentication with secure cookies
- **Password hashing** with bcrypt
- **Audit logging** for all user actions
- **Rate limiting** to prevent abuse

---

## 📚 Documentation

- **Swagger API Documentation**: Available at `/` (root endpoint)
- **Search API Guide**: `/docs/USER_SEARCH_API.md`
- **Permission System**: `/docs/PERMISSION_SYSTEM.md`
- **API Examples**: `/docs/SEARCH_API_EXAMPLES.md`

---

## � API Response Format

### ✅ Success Response
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

### ❌ Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### 📊 Statistics Response
```json
{
  "success": true,
  "stats": {
    "total": 1000,
    "active": 850,
    "locked": 15,
    "byStatus": [
      { "_id": "active", "count": 850 },
      { "_id": "inactive", "count": 100 }
    ],
    "byRole": [
      { "_id": "student", "count": 800 },
      { "_id": "admin", "count": 200 }
    ]
  }
}
```

---

## 🔧 Environment Configuration

Create a `config/config.env` file with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DB_URI=mongodb://localhost:27017/ims_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=IMS System
```

---

## �🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/IMS_BACKEND.git
   cd IMS_BACKEND
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config/config.env.example config/config.env
   # Edit config/config.env with your settings
   ```

4. **Seed default roles and permissions**
   ```bash
   node seeders/permissionSeeder.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - API: `http://localhost:4000`
   - Swagger Documentation: `http://localhost:4000`

### Production Deployment

1. **Set NODE_ENV to production**
2. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ims-backend"
   ```

3. **Set up reverse proxy** (Nginx recommended)
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure HTTP-only cookies
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **Logging**: Winston with MongoDB transport
- **Validation**: Custom validators with comprehensive error handling
- **File Upload**: Multer with Cloudinary integration
- **Email**: Nodemailer with SMTP support

---

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Security**: HTTP-only cookies, secure flags in production
- **Rate Limiting**: Configurable limits per endpoint
- **Account Lockout**: Automatic lockout after failed attempts
- **CORS Protection**: Configurable origin whitelist
- **Helmet Security**: Security headers and XSS protection
- **Input Validation**: Comprehensive request validation
- **Audit Logging**: All user actions logged to database

---

## 📈 Performance Features

- **Database Indexing**: Optimized indexes for search queries
- **Pagination**: Efficient cursor-based pagination
- **Query Optimization**: Lean queries and selective field projection
- **Caching Strategy**: Redis integration ready
- **Connection Pooling**: MongoDB connection optimization
- **Compression**: Gzip compression for responses

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test:auth
npm run test:users
npm run test:search
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs` folder

---

## 🔄 Version History

- **v2.0.0** - Advanced search, pagination, and filtering system
- **v1.5.0** - Role-based access control implementation
- **v1.0.0** - Initial release with basic authentication




## 🔐 Permission System Structure

### Module-Based Permissions Tree

```
📁 Permission System
├── 👥 User Module
│   ├── user.create    (Create new users)
│   ├── user.read      (View user details)
│   ├── user.update    (Update user information)
│   ├── user.delete    (Delete users)
│   ├── user.export    (Export user data)
│   └── user.import    (Import user data)
│
├── 🎭 Role Module
│   ├── role.create    (Create new roles)
│   ├── role.read      (View role details)
│   ├── role.update    (Update role permissions)
│   ├── role.delete    (Delete roles)
│   └── role.export    (Export role data)
│
├── 📊 Dashboard Module
│   └── dashboard.read (View dashboard & analytics)
│
├── ⚙️ Settings Module
│   ├── settings.read   (View system settings)
│   └── settings.update (Update system settings)
│
├── 📈 Reports Module
│   ├── reports.create (Create new reports)
│   ├── reports.read   (View reports)
│   └── reports.export (Export report data)
│
├── 📝 Logs Module
│   ├── log.read       (View system logs)
│   ├── log.delete     (Delete old logs)
│   └── log.export     (Export log data)
│
└── 👤 Profile Module
    ├── profile.read   (View own profile)
    └── profile.update (Update own profile)
```

### Role Permission Hierarchy

```
🏢 Role System
│
├── 👑 Admin Role (Level: 80)
│   ├── 📊 Access: Full System Control
│   ├── 🔢 Permissions: All 30 permissions
│   └── 🎯 Capabilities:
│       ├── ✅ All User Management (CRUD + Export/Import)
│       ├── ✅ All Role Management (CRUD + Export)
│       ├── ✅ All Permission Management (CRUD)
│       ├── ✅ Admin Panel Access (CRUD)
│       ├── ✅ Dashboard & Analytics
│       ├── ✅ System Settings Management
│       ├── ✅ Reports Management
│       ├── ✅ Log Management & Export
│       └── ✅ Profile Management
│
└── 🎓 Student Role (Level: 15) - DEFAULT
    ├── 📊 Access: Read-Only + Profile
    ├── 🔢 Permissions: 10 permissions
    └── 🎯 Capabilities:
        ├── 👀 user.read         (View users)
        ├── 👀 role.read         (View roles)
        ├── 👀 permission.read   (View permissions)
        ├── 👀 dashboard.read    (View dashboard)
        ├── 👀 admin.read        (View admin panel)
        ├── 👀 log.read          (View logs)
        ├── 👀 settings.read     (View settings)
        ├── 👀 reports.read      (View reports)
        ├── 👀 profile.read      (View own profile)
        └── ✏️ profile.update    (Update own profile)
```

### Permission Naming Convention
- **Format**: `{module}.{action}`
- **Modules**: user, role, permission, admin, dashboard, settings, reports, log, profile
- **Actions**: create, read, update, delete, export, import
- **Examples**: `user.create`, `role.read`, `permission.update`

---

## 📄 JSON Permission Storage

### 🎭 Role JSON Structure

#### 👑 Admin Role (All Permissions)
```json
{
  "_id": "admin_role_id",
  "RoleName": "admin",
  "description": "Administrator with full system access and all permissions",
  "level": 1,
  "isActive": true,
  "permissions": [
    "user.create", "user.read", "user.update", "user.delete", "user.export", "user.import",
    "role.create", "role.read", "role.update", "role.delete", 
    "admin.create", "admin.read", "admin.update", "admin.delete",
    "dashboard.read", "settings.read", "settings.update",
    "reports.create", "reports.read", "reports.export",
    "log.read", "log.delete", "log.export",
    "profile.read", "profile.update"
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "admin_user_id",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "updatedBy": "admin_user_id"
}

```

#### 🎓 Student Role (Read-Only + Profile)
```json
{
  "_id": "student_role_id",
  "RoleName": "student",
  "description": "Default role for new users with read-only permissions",
  "level": 15,
  "isActive": true,
  "permissions": [
    "user.read", "role.read", "permission.read", "admin.read",
    "dashboard.read", "settings.read", "reports.read", "log.read",
    "profile.read", "profile.update"
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 🔧 Database Storage Options

#### Option 1: Permission Names (Current Implementation)
```json
{
  "permissions": [
    "user.create",
    "user.read",
    "role.update"
  ]
}
```

#### Option 2: Permission ObjectIds (Recommended for Performance)
```json
{
  "permissions": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

#### Option 3: Grouped by Module
```json
{
  "permissions": {
    "user": ["create", "read", "update", "delete", "export", "import"],
    "role": ["create", "read", "update", "delete", "export"],
    "dashboard": ["read"],
    "profile": ["read", "update"]
  }
}
```

### 🚀 API Request Examples

#### Create Role with Permissions
```bash
POST /api/v1/roles
Content-Type: application/json

{
  "RoleName": "manager",
  "description": "Manager role with limited admin access",
  "level": 50,
  "permissions": [
    "user.read", "user.update", "role.read",
    "dashboard.read", "reports.read", "reports.create",
    "profile.read", "profile.update"
  ]
}
```

#### Update Role Permissions
```bash
PUT /api/v1/roles/:id/permissions
Content-Type: application/json

{
  "permissions": [
    "user.create", "user.read", "user.update",
    "dashboard.read", "profile.read", "profile.update"
  ]
}
```

#### Update User Details (Admin)
```bash
PUT /api/v1/users/admin/user/{userId}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "507f1f77bcf86cd799439011",
  "isActive": true,
  "avatar": {
    "public_id": "user_avatars/john_doe",
    "url": "https://example.com/avatars/john_doe.jpg"
  }
}
```

#### Update User Role with Role Name
```bash
PUT /api/v1/users/admin/user/{userId}
Content-Type: application/json

{
  "role": "admin"
}
```

#### Update User Status Only
```bash
PUT /api/v1/users/admin/user/{userId}
Content-Type: application/json

{
  "isActive": false
}
```

### 📝 Seeder JSON Format
```json
{
  "roles": [
    {
      "RoleName": "admin",
      "description": "Administrator with full system access",
      "level": 80,
      "isSystem": true,
      "permissions": "ALL"
    },
    {
      "RoleName": "student",
      "description": "Default role with read-only access",
      "level": 15,
      "isSystem": true,
      "permissions": [
        "user.read", "role.read", "permission.read", "admin.read",
        "dashboard.read", "settings.read", "reports.read", "log.read",
        "profile.read", "profile.update"
      ]
    }
  ]
}
```

### 💡 Best Practices

- **Use ObjectIds in Database**: Store permission ObjectIds for better performance
- **Use Names in API**: Use permission names in API requests for readability
- **Validate Permissions**: Always validate that permissions exist before assigning
- **Cache Role Permissions**: Cache frequently accessed role permissions
- **Audit Changes**: Log all permission changes for security auditing
- **Default Role**: New users automatically get 'student' role
- **Permission Inheritance**: Higher level roles can inherit lower level permissions
- **Modular Design**: Group permissions by module for better organization
- **Consistent Naming**: Follow `module.action` convention for all permissions



Roles Api 
- Create Role
- Update Role
- Delete
- GET
- GET /:id