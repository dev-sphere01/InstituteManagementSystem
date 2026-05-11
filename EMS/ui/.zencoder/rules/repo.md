# Employee Management System (EMS) - Frontend Repository

## 🏢 Project Overview
This is the frontend application of CUPLEMS (Central University Punjab Employee Management System), a comprehensive employee management solution built with React 19 and modern web technologies.

## 🛠️ Tech Stack

### Core Technologies
- **React 19.1.0** - Frontend framework with latest features
- **Vite 7.0.4** - Build tool and development server
- **React Router DOM 7.6.3** - Client-side routing
- **Zustand 5.0.6** - State management
- **Axios 1.11.0** - HTTP client
- **Tailwind CSS 4.1.11** - Utility-first CSS framework

### UI/UX Libraries
- **Lucide React 0.525.0** - Icon library
- **React Icons 5.5.0** - Additional icons
- **Framer Motion 12.23.12** - Animation library
- **@headlessui/react 2.2.4** - Headless UI components
- **@fortawesome/fontawesome-free 6.7.2** - FontAwesome icons

### Data Management & Visualization
- **@tanstack/react-table 8.21.3** - Table management
- **Chart.js 4.5.0** & **react-chartjs-2 5.3.0** - Data visualization
- **XLSX 0.18.5** - Excel file handling

## 📁 Project Structure

```
src/
├── assets/           # Static assets (images, etc.)
├── components/       # Reusable UI components
├── demopages/        # Demo/test pages
├── layouts/          # Layout components (Outer, Inner, Employee)
├── pages/            # Main application pages
│   ├── Administration/    # Admin management
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard components
│   ├── EmployeeManagement/ # Employee CRUD operations
│   ├── EmployeePages/    # Employee-specific pages
│   ├── Masters/          # Master data management
│   ├── NotFound/         # 404 page
│   ├── Payroll/          # Payroll management
│   └── Profile/          # User profile pages
├── routes/           # Route configurations
├── services/         # API services and business logic
│   ├── Departments/      # Department services
│   ├── Employees/        # Employee services
│   ├── LoansAdvances/    # Loan management services
│   ├── Positions/        # Position services
│   └── SalaryStructure/  # Salary services
├── store/            # Zustand state stores
├── templates/        # Excel templates
└── utils/            # Utility functions
```

## 👥 User Roles & Access Control

### Role-Based Routing
The application implements role-based access control with two main user types:

1. **Admin Users (roleId: 1)**
   - Full dashboard access with all management features
   - Employee management, payroll, administration
   - Uses `InnerLayout` component

2. **Regular Employees (roleId: other)**
   - Limited access to personal features
   - Attendance, leave management, profile, payslips
   - Uses `EmployeeLayout` component

## 🔐 Authentication & Security

### Authentication Flow
- JWT-based authentication with automatic token expiration handling
- Centralized auth state management via Zustand store
- Protected routes with role-based access control
- Automatic logout on token expiration
- Password change flow for auto-generated passwords

### Security Features
- Token validation on every API request
- Automatic session monitoring (30-second intervals)
- 5-minute expiration warnings
- Centralized logout utility
- Request/response interceptors for auth handling

## 🔄 State Management

### Zustand Stores
- **authStore.js** - Authentication state and user management
- **empDataStore.js** - Employee data management
- **employeeStore.js** - Employee-specific operations

### Key Auth Store Methods
- `initializeAuth()` - Initialize auth from localStorage
- `startTokenMonitoring()` - Monitor token expiration
- `login(userData)` - Handle user login
- `logout()` - Clean logout with storage cleanup
- `needsPasswordChange()` - Check for mandatory password changes
- `getUserRole()` - Get user role for routing

## 🌐 API Architecture

### API Configuration
- Centralized Axios instance with base URL configuration
- Request/response interceptors for auth and error handling
- 10-minute timeout for long-running operations
- Automatic token attachment for authenticated requests

### Service Structure
Services are organized by domain:
- **Employees/** - Employee CRUD, bulk import, personal data
- **Departments/** - Department management
- **Positions/** - Position/role management
- **LoansAdvances/** - Loan and advance management
- **SalaryStructure/** - Salary structure management

## 📊 Key Features

### Employee Management
- Add/Edit/View employee profiles
- Bulk employee import via Excel
- Employee onboarding workflow
- Asset management
- Document management

### Payroll System
- Salary structure management
- Payroll processing
- Payslip generation
- Loans and advances management
- Payroll assignment

### Administration
- User role management
- System settings
- Audit logs
- Department and position management

### Employee Self-Service
- Personal profile management
- Attendance tracking
- Leave management
- Bank details management
- Document access
- Payslip viewing

## 🔧 Development Configuration

### Path Aliases
- `@/` - Resolves to `src/` directory
- Configured in `vite.config.js`

### Build Configuration
- Vite with React plugin
- Tailwind CSS integration
- Excel file asset handling
- ESLint configuration for code quality

### Environment Setup
- Development server: `npm run dev`
- Production build: `npm run build`
- Linting: `npm run lint`
- Preview: `npm run preview`

## 📄 File Handling

### Excel Integration
- Employee data import templates
- Attendance templates
- Excel parsing and validation
- Error handling for malformed data

### Asset Management
- Template files in `src/templates/`
- Image assets in `src/assets/images/`
- Vite configuration for Excel file handling

## 🎨 UI/UX Patterns

### Layout System
- **OuterLayout** - Public pages (login, forgot password)
- **InnerLayout** - Admin dashboard
- **EmployeeLayout** - Employee dashboard
- Responsive design with Tailwind CSS

### Component Architecture
- Reusable components in `components/`
- Page-specific components within page directories
- Global providers for notifications and confirmations

### Navigation
- Role-based sidebar navigation
- Breadcrumb navigation
- Protected route handling

## 🚨 Error Handling

### Global Error Management
- Centralized error handler service
- Notification system for user feedback
- Confirmation dialogs for destructive actions
- Token expiration handling

### API Error Patterns
- 401/403 handling with automatic logout
- Request timeout handling
- Network error recovery
- Validation error display

## 📱 Demo & Testing

### Demo Pages
- **ExcelUploadDemo** - Excel file upload testing
- **EmpDataMapDemo** - Employee data mapping demonstration

## 🔄 State Persistence
- Auth state in localStorage
- Employee data caching
- Session management across page reloads

## 🎯 Development Guidelines

### Code Organization
- Feature-based folder structure
- Separation of concerns (services, components, pages)
- Consistent naming conventions
- Modular service architecture

### Best Practices
- Use absolute imports with @ alias
- Centralized API configuration
- Role-based component rendering
- Proper error boundaries
- Clean component separation

This repository represents a production-ready employee management system with robust authentication, role-based access control, and comprehensive employee lifecycle management features.