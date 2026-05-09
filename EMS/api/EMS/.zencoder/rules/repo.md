---
description: Repository Information Overview
alwaysApply: true
---

# EMS API - Employee Management System

## Summary
EMS (Employee Management System) is an ASP.NET Core 8.0 REST API backend designed for comprehensive employee lifecycle management. The system handles employee data, payroll, attendance, leave management, performance assessments, loans & advances, and comprehensive reporting capabilities. Built with a MySQL database backend and Entity Framework Core ORM, it provides JWT-based authentication and CORS-enabled cross-origin access.

## Structure
- **Controllers/**: RESTful API endpoints for all business domains (employees, departments, attendance, payroll, etc.)
- **Models/**: Entity Framework Core data models and DTOs for API contracts
- **Data/**: Database context (EMSDbContext) for MySQL connectivity
- **Services/**: Business logic services (EmailSender, PasswordGenerate)
- **Migrations/**: Entity Framework Core database schema migrations
- **wwwroot/**: Static file storage for profile pictures, documents, and cheques
- **Properties/**: Project configuration including launch settings and publish profiles

## Language & Runtime
**Language**: C#
**Framework**: ASP.NET Core 8.0
**Runtime**: .NET 8.0
**Build System**: MSBuild (.NET SDK)
**Package Manager**: NuGet

## Dependencies
**Core Framework**:
- Microsoft.AspNetCore.Authentication.JwtBearer 8.0.11 (JWT auth)
- Microsoft.AspNetCore.Cors 2.3.0 (CORS support)

**Database**:
- Microsoft.EntityFrameworkCore 8.0.18
- Microsoft.EntityFrameworkCore.SqlServer 8.0.18
- Microsoft.EntityFrameworkCore.Tools 8.0.18
- Pomelo.EntityFrameworkCore.MySql 8.0.3
- MySql.Data 9.3.0

**API & Documentation**:
- Swashbuckle.AspNetCore 6.4.0 (Swagger/OpenAPI)

**File & Data Processing**:
- ClosedXML 0.105.0 (Excel processing)
- NPOI 2.7.4 (Office document handling)
- CsvHelper 33.1.0 (CSV parsing)

**Authentication**:
- System.IdentityModel.Tokens.Jwt 8.12.1

**Communication**:
- AWSSDK.SimpleEmail 4.0.0.13 (Email via AWS SES)
- MailKit 4.13.0 (SMTP email)
- Microsoft.AspNet.Mvc 5.3.0

**Development**:
- Microsoft.VisualStudio.Web.CodeGeneration.Design 8.0.7

## Build & Installation
```
dotnet restore
dotnet build
dotnet build -c Release
dotnet run --launch-profile https
dotnet publish -c Release -o ./publish
```

## Configuration
**Configuration Files**:
- appsettings.json: Main configuration (database connection, JWT settings, email settings)
- appsettings.Development.json: Development-specific overrides
- launchSettings.json: Runtime profiles (HTTP/HTTPS/IIS Express)

**Key Configuration**:
- JWT: Issuer, Audience, Secret Key, Expiration time (360 min)
- Database: MySQL connection string with server, port, database, credentials
- Email: SMTP settings with Gmail integration
- CORS: Allows all origins, methods, and headers

## Main Entry Point
- **Program.cs**: ASP.NET Core application bootstrapper configuring services, middleware, JWT authentication, database context, CORS, and HTTP request pipeline
- **Default Port**: HTTP localhost:5274, HTTPS localhost:7244
- **API Documentation**: Available at /swagger endpoint

## Database
- **Type**: MySQL (version 8.0.23+)
- **ORM**: Entity Framework Core 8.0.18
- **Migrations**: 30+ migrations covering employee data, assessments, payroll, leave, loans, reviews, and permissions
- **Context**: EMSDbContext in Data/EMSDbContext.cs

## Key Features
- **Employee Management**: Complete employee lifecycle with credentials and undertakings
- **Payroll System**: CTC, salary structures, monthly transactions, and payroll slabs
- **Attendance Tracking**: Daily attendance and total hours calculation
- **Leave Management**: Leaves, balances, and transactions
- **Loans & Advances**: LnA management with balances and transactions
- **Performance**: Employee assessments, reviews, and ratings
- **HR Documents**: Document management with file uploads
- **Bank Details**: Employee banking information and cancelled cheques
- **Reports**: Comprehensive reporting capabilities
