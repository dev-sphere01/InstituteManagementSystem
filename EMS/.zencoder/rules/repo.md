---
description: Repository Information Overview
alwaysApply: true
---

# CUPL EMS Repository Information

## Repository Summary

CUPL EMS (Employee Management System) is a full-stack web application with a three-tier architecture consisting of a React frontend, Node.js notification service, and ASP.NET Core backend API. The system manages employee data, leave management, performance assessments, and reporting features.

## Repository Structure

The repository is organized as a monorepo with three independent projects:

### Main Repository Components
- **ui/**: React-based frontend application with Vite build system and Tailwind CSS styling
- **nodeapi/**: Node.js Express server handling real-time notifications via Socket.io
- **api/**: ASP.NET Core 8 REST API managing employee data and business logic with MySQL database
- **.github/**: GitHub workflows for CI/CD automation
- **.vscode/**: VS Code workspace configuration
- **.zencoder/**: Zencoder rules and configurations

## Projects

### UI Project (React Frontend)
**Configuration File**: `ui/package.json`

#### Language & Runtime
**Language**: JavaScript (JSX)
**Node.js Version**: 18+ (recommended)
**Runtime**: Browser (ES2020+)
**Build System**: Vite 7.0.4
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react 19.1.0, react-dom 19.1.0 - UI framework
- react-router-dom 7.6.3 - Client-side routing
- axios 1.11.0 - HTTP client
- zustand 5.0.6 - State management
- react-big-calendar 1.19.4 - Calendar component for leave management
- chart.js 4.5.0, react-chartjs-2 5.3.0 - Data visualization
- jspdf 3.0.3, jspdf-autotable 5.0.2 - PDF generation for reports
- xlsx 0.18.5 - Excel file export
- framer-motion 12.23.12 - Animation library
- lucide-react 0.525.0, react-icons 5.5.0 - Icon libraries
- @headlessui/react 2.2.4 - Accessible UI components
- @tanstack/react-table 8.21.3 - Data table component
- moment 2.29.4 - Date/time utilities
- @tailwindcss/vite 4.1.11 - Tailwind CSS integration

**Development Dependencies**:
- vite 7.0.4 - Build tool and dev server
- @vitejs/plugin-react 4.6.0 - React support for Vite
- eslint 9.30.1, @eslint/js 9.30.1 - Code linting
- eslint-plugin-react-hooks, eslint-plugin-react-refresh - React ESLint rules

#### Build & Installation
```bash
cd ui
npm install
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

#### Structure
**Entry Point**: `ui/index.html` (renders `src/main.jsx`)
**Main App**: `ui/src/App.jsx`
**Directories**:
- `src/pages/` - Page components organized by feature (EmployeeManagement, LeaveManagement, etc.)
- `src/components/` - Reusable React components
- `src/services/` - API client services using axios
- `src/store/` - Zustand state management stores
- `src/routes/` - Routing configuration
- `src/layouts/` - Layout components (AppLayout, etc.)
- `src/assets/` - Images and static files
- `src/utils/` - Utility functions

#### Configuration
**Vite Config**: Uses React plugin, Tailwind CSS integration, asset handling for Excel files
**ESLint**: Configured for React with hooks validation and refresh plugin support
**JS Config**: Path aliases (`@/*` maps to `src/*`)

---

### Node API Project (Notification Service)
**Configuration File**: `nodeapi/package.json`

#### Language & Runtime
**Language**: JavaScript (CommonJS)
**Node.js Version**: 12+ (typically 14+)
**Runtime**: Node.js
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express 5.1.0 - Web framework
- cors 2.8.5 - Cross-origin resource sharing middleware
- socket.io 4.8.1 - Real-time bidirectional communication
- nodemon 3.1.11 - Development server auto-reload

#### Build & Installation
```bash
cd nodeapi
npm install
node server.js       # Start the server
npm run dev         # With nodemon (if configured)
```

#### Structure
**Entry Point**: `nodeapi/server.js`
**Directories**:
- `config/` - Configuration files (socket.js for Socket.io setup)
- `routes/` - API route handlers (notify.js for notifications)
- `node_modules/` - Dependencies

#### Configuration
**Server Setup**: Creates HTTP server with Express and CORS enabled, initializes Socket.io for real-time notifications
**Purpose**: Handles real-time notification delivery to connected clients

---

### ASP.NET Core API Project (.NET Backend)
**Configuration File**: `api/EMS/EMS.csproj`

#### Language & Runtime
**Language**: C# (.NET)
**Version**: .NET 8.0
**Build System**: MSBuild
**Package Manager**: NuGet

#### Key Dependencies
- **Entity Framework Core** (8.0.18) - ORM for database operations
- **Microsoft.EntityFrameworkCore.SqlServer** (8.0.18) - SQL Server support
- **Pomelo.EntityFrameworkCore.MySql** (8.0.3) - MySQL support
- **MySql.Data** (9.3.0) - MySQL connector
- **Microsoft.AspNetCore.Authentication.JwtBearer** (8.0.11) - JWT authentication
- **Swashbuckle.AspNetCore** (6.4.0) - Swagger/OpenAPI documentation
- **MailKit** (4.13.0) - Email client for notifications
- **AWSSDK.SimpleEmail** (4.0.0.13) - AWS SES email service
- **ClosedXML** (0.105.0), **CsvHelper** (33.1.0), **NPOI** (2.7.4) - Excel/CSV file handling
- **System.IdentityModel.Tokens.Jwt** (8.12.1) - JWT token generation

#### Build & Installation
```bash
cd api/EMS
dotnet restore
dotnet build
dotnet run               # Start development server
dotnet publish          # Publish for deployment
```

#### Structure
**Solution**: `api/EMS.sln`
**Entry Point**: `api/EMS/Program.cs`
**Project Structure**:
- `Controllers/` - API endpoint handlers
- `Services/` - Business logic services
- `Models/` - Data models
- `Data/` - Database context and repositories (EMSDbContext)
- `Migrations/` - Entity Framework migrations for schema versioning
- `Properties/` - Project properties
- `wwwroot/` - Static files and document uploads

#### Configuration
**Database**: MySQL 8.0.23+ (connection via Pomelo.EntityFrameworkCore.MySql)
**Authentication**: JWT Bearer token-based authentication
**CORS**: Enabled for all origins in development
**API Documentation**: Swagger UI enabled
**Data Protection**: DPAPI for sensitive configuration strings

#### Features
- Employee management with profile pictures
- Leave management system
- Performance assessments
- Report generation (PDF, Excel)
- Document management (cancelled cheques, experience certificates, docs)
- Email notifications via MailKit/AWS SES

---

## Repository-Level Configuration

**Root Package**: `package.json` - Meta configuration
**Root .gitignore**: Standard ignores for Node.js and .NET projects (node_modules, bin/, obj/, dist/)
**Git Workflows**: Configured in `.github/workflows/` for CI/CD

## Development Setup Summary

1. **Install UI dependencies**: `cd ui && npm install`
2. **Install Node API dependencies**: `cd nodeapi && npm install`
3. **Setup .NET API**: `cd api/EMS && dotnet restore`
4. **Start UI dev server**: `npm run dev` (runs on http://localhost:5173 by Vite)
5. **Start Node API**: `node server.js` (notification service)
6. **Start .NET API**: `dotnet run` (main REST API)

## Database Configuration

**Database Type**: MySQL 8.0+
**ORM**: Entity Framework Core
**Migrations**: Located in `api/EMS/Migrations/`
**Connection String**: Encrypted with DPAPI in appsettings.json

## Authentication

**Method**: JWT (JSON Web Tokens)
**Provider**: ASP.NET Core JWT Bearer middleware
**Token Generation**: System.IdentityModel.Tokens.Jwt library

## Key Documentation

Additional project documentation available:
- `ui/README.md` - UI project details
- `ui/REPORTS_FEATURE_GUIDE.md` - Reporting feature implementation
- `ui/LEAVE_CALENDAR_GUIDE.md` - Leave calendar functionality
- `Leave Management System.md` - System overview
