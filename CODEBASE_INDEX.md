# Codebase Index

This document provides an overview of the Institute Management System codebase.

## Project Structure

The project is divided into two main parts:

*   `IMS_BACKEND`: The Node.js backend application.
*   `IMS_FRONTEND`: The React frontend application.

---

## `IMS_BACKEND`

The backend is a Node.js application using Express.js and Mongoose.

### Key Directories

*   **`api/v1/routes`**: Contains all the API route definitions. Each file corresponds to a resource (e.g., `userRoutes.js`, `enquiryRoutes.js`).
*   **`config`**: Holds configuration files, like database connection settings.
*   **`controllers`**: Contains the business logic for each route. Controllers are responsible for handling requests, interacting with models, and sending responses.
*   **`docs`**: Markdown files with project documentation.
*   **`middlewares`**: Custom Express middleware for tasks like authentication, error handling, and validation.
*   **`models`**: Mongoose schemas defining the structure of data in MongoDB.
*   **`seeders`**: Scripts to populate the database with initial data.
*   **`services`**: Contains business logic that can be shared across controllers.
*   **`swagger`**: Files related to Swagger API documentation generation.
*   **`tests`**: Test files for the application.
*   **`utils`**: Utility functions and helper classes used throughout the backend.
*   **`validators`**: Validation logic for incoming requests.

### Dependencies

*   **bcryptjs**: Library for hashing passwords.
*   **body-parser**: Middleware for parsing incoming request bodies.
*   **cookie-parser**: Middleware for parsing cookies.
*   **cors**: Middleware for enabling Cross-Origin Resource Sharing.
*   **dotenv**: Loads environment variables from a `.env` file.
*   **express**: Web framework for Node.js.
*   **express-rate-limit**: Middleware for rate-limiting requests.
*   **helmet**: Middleware for securing Express apps by setting various HTTP headers.
*   **jsonwebtoken**: Library for generating and verifying JSON Web Tokens.
*   **mongoose**: Object Data Modeling (ODM) library for MongoDB.
*   **morgan**: Middleware for logging HTTP requests.
*   **nodemailer**: Library for sending emails.
*   **react-router-dom**: Routing library for React applications.
*   **swagger-jsdoc**: Generates Swagger/OpenAPI documentation from JSDoc comments.
*   **swagger-ui-express**: Serves auto-generated Swagger UI documentation.
*   **validator**: Library for string validation and sanitization.
*   **winston**: A logger for just about everything.
*   **winston-transport**: A base for creating custom transports for Winston.

### Scripts

*   **`test`**: Runs tests.
*   **`start`**: Starts the server in production mode.
*   **`dev`**: Starts the server in development mode with nodemon.
*   **`build`**: Builds the frontend application.
*   **`heroku-postbuild`**: Installs frontend dependencies and builds the frontend for Heroku deployment.

### File Index

*   `IMS_BACKEND/app.js`
*   `IMS_BACKEND/LICENSE`
*   `IMS_BACKEND/package-lock.json`
*   `IMS_BACKEND/package.json`
*   `IMS_BACKEND/readme.md`
*   `IMS_BACKEND/server.js`
*   `IMS_BACKEND/api/v1/routes/admissionRoutes.js`
*   `IMS_BACKEND/api/v1/routes/enquiryRoutes.js`
*   `IMS_BACKEND/api/v1/routes/index.js`
*   `IMS_BACKEND/api/v1/routes/logRoutes.js`
*   `IMS_BACKEND/api/v1/routes/roleRoutes.js`
*   `IMS_BACKEND/api/v1/routes/userRoutes.js`
*   `IMS_BACKEND/config/config.env.sample`
*   `IMS_BACKEND/config/database.js`
*   `IMS_BACKEND/controllers/admissioncontroller.js`
*   `IMS_BACKEND/controllers/enquirycontroller.js`
*   `IMS_BACKEND/controllers/logController.js`
*   `IMS_BACKEND/controllers/roleController.js`
*   `IMS_BACKEND/controllers/userController.js`
*   `IMS_BACKEND/docs/API_DOCUMENTATION.md`
*   `IMS_BACKEND/docs/PERMISSION_SYSTEM.md`
*   `IMS_BACKEND/docs/ROLE_API_EXAMPLES.md`
*   `IMS_BACKEND/docs/SEARCH_API_EXAMPLES.md`
*   `IMS_BACKEND/docs/USER_SEARCH_API.md`
*   `IMS_BACKEND/middlewares/auditMiddleware.js`
*   `IMS_BACKEND/middlewares/auth.js`
*   `IMS_BACKEND/middlewares/catchAsyncErrors.js`
*   `IMS_BACKEND/middlewares/error.js`
*   `IMS_BACKEND/middlewares/permission.js`
*   `IMS_BACKEND/middlewares/validateAdmission.js`
*   `IMS_BACKEND/middlewares/validateEnquiry.js`
*   `IMS_BACKEND/middlewares/validator.js`
*   `IMS_BACKEND/models/admission.js`
*   `IMS_BACKEND/models/auditLogModel.js`
*   `IMS_BACKEND/models/Enquiry.js`
*   `IMS_BACKEND/models/logModel.js`
*   `IMS_BACKEND/models/roleModel.js`
*   `IMS_BACKEND/models/userModel.js`
*   `IMS_BACKEND/seeders/permissionSeeder.js`
*   `IMS_BACKEND/seeders/roleSeeder.js`
*   `IMS_BACKEND/seeders/studentAdminSeeder.js`
*   `IMS_BACKEND/services/permissionService.js`
*   `IMS_BACKEND/services/roleService.js`
*   `IMS_BACKEND/services/searchService.js`
*   `IMS_BACKEND/services/userService.js`
*   `IMS_BACKEND/swagger/index.js`
*   `IMS_BACKEND/swagger/definitions/adminDefinitions.js`
*   `IMS_BACKEND/swagger/definitions/admissionDefinitions.js`
*   `IMS_BACKEND/swagger/definitions/auditDefinitions.js`
*   `IMS_BACKEND/swagger/definitions/enquiryDefinations.js`
*   `IMS_BACKEND/swagger/definitions/logDefinitions.js`
*   `IMS_BACKEND/swagger/definitions/userDefinitions.js`
*   `IMS_BACKEND/swagger/paths/rolePaths.js`
*   `IMS_BACKEND/tests/systemRoleProtection.test.js`
*   `IMS_BACKEND/tests/userRoleHandling.test.js`
*   `IMS_BACKEND/utils/apiFeatures.js`
*   `IMS_BACKEND/utils/auditLogger.js`
*   `IMS_BACKEND/utils/dbTransport.js`
*   `IMS_BACKEND/utils/ErrorHandler.js`
*   `IMS_BACKEND/utils/jwtToken.js`
*   `IMS_BACKEND/utils/logger.js`
*   `IMS_BACKEND/utils/queryHelpers.js`
*   `IMS_BACKEND/utils/sendEmail.js`
*   `IMS_BACKEND/validators/userValidators.js`

---

## `IMS_FRONTEND`

The frontend is a React application built with Vite.

### Key Directories

*   **`src/assets`**: Static assets like images and SVGs.
*   **`src/components`**: Reusable React components used across the application (e.g., `Navbar.jsx`, `Footer.jsx`).
*   **`src/context`**: React Context API providers for state management.
*   **`src/layouts`**: Components that define the overall structure of the application's pages.
*   **`src/pages`**: Components that represent entire pages, corresponding to specific routes.
    *   **`auth`**: Pages for authentication (Login, Register).
    *   **`dashboard`**: Dashboard pages.
    *   **`enquiry`**: Enquiry form and related components.
    *   **`masters`**: Pages for managing master data like courses, batches, and roles.
*   **`src/routes`**: Routing configuration, including protected and role-based routes.
*   **`src/services`**: Modules for interacting with the backend API and other external services.
*   **`src/store`**: State management using Zustand.
*   **`src/styles`**: Global CSS styles.

### Dependencies

*   **axios**: Promise-based HTTP client for the browser and Node.js.
*   **react**: A JavaScript library for building user interfaces.
*   **react-dom**: Serves as the entry point to the DOM and server renderers for React.
*   **react-router-dom**: DOM bindings for React Router.
*   **zustand**: A small, fast, and scalable state-management solution.

### Scripts

*   **`dev`**: Starts the development server.
*   **`build`**: Builds the application for production.
*   **`lint`**: Lints the codebase.
*   **`preview`**: Previews the production build.
*   **`clean`**: Clears the Vite cache.

### File Index

*   `IMS_FRONTEND/eslint.config.js`
*   `IMS_FRONTEND/index.html`
*   `IMS_FRONTEND/package-lock.json`
*   `IMS_FRONTEND/package.json`
*   `IMS_FRONTEND/postcss.config.js`
*   `IMS_FRONTEND/README.md`
*   `IMS_FRONTEND/tailwind.config.js`
*   `IMS_FRONTEND/vite.config.js`
*   `IMS_FRONTEND/src/App.css`
*   `IMS_FRONTEND/src/App.jsx`
*   `IMS_FRONTEND/src/index.css`
*   `IMS_FRONTEND/src/main.jsx`
*   `IMS_FRONTEND/src/assets/react.svg`
*   `IMS_FRONTEND/src/components/Breadcrumb.jsx`
*   `IMS_FRONTEND/src/components/Footer.jsx`
*   `IMS_FRONTEND/src/components/Navbar.jsx`
*   `IMS_FRONTEND/src/components/NavigationGuard.jsx`
*   `IMS_FRONTEND/src/components/Notification.jsx`
*   `IMS_FRONTEND/src/components/PermissionGuard.jsx`
*   `IMS_FRONTEND/src/components/PrimarySideBar.jsx`
*   `IMS_FRONTEND/src/components/SecondarySideBar.jsx`
*   `IMS_FRONTEND/src/components/common/ThemeProvider.jsx`
*   `IMS_FRONTEND/src/components/common/ThemeToggle.jsx`
*   `IMS_FRONTEND/src/context/AuthContext.jsx`
*   `IMS_FRONTEND/src/layouts/InnerLayout.jsx`
*   `IMS_FRONTEND/src/layouts/OuterLayout.jsx`
*   `IMS_FRONTEND/src/layouts/StudentLayout.jsx`
*   `IMS_FRONTEND/src/pages/Home.jsx`
*   `IMS_FRONTEND/src/pages/NotFound.jsx`
*   `IMS_FRONTEND/src/pages/Register.jsx`
*   `IMS_FRONTEND/src/pages/Reports.jsx`
*   `IMS_FRONTEND/src/pages/Settings.jsx`
*   `IMS_FRONTEND/src/pages/auth/AuthFailed.jsx`
*   `IMS_FRONTEND/src/pages/auth/AuthSuccess.jsx`
*   `IMS_FRONTEND/src/pages/auth/ForgotPassword.jsx`
*   `IMS_FRONTEND/src/pages/auth/Login.jsx`
*   `IMS_FRONTEND/src/pages/auth/Register.jsx`
*   `IMS_FRONTEND/src/pages/auth/ResetPassword.jsx`
*   `IMS_FRONTEND/src/pages/dashboard/Dashboard.jsx`
*   `IMS_FRONTEND/src/pages/dashboard/StudentDashboard.jsx`
*   `IMS_FRONTEND/src/pages/dashboard/components/Cards.jsx`
*   `IMS_FRONTEND/src/pages/dashboard/components/Graphs.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/EnquiryForm.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/styleClasses.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/Contact.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/CoursePref.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/Educational.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/GoalsAndReq.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/Personal.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/Referral.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/Registration.jsx`
*   `IMS_FRONTEND/src/pages/enquiry/components/SchedulePref.jsx`
*   `IMS_FRONTEND/src/pages/masters/batch/Batch.jsx`
*   `IMS_FRONTEND/src/pages/masters/batch/components/AddBatch.jsx`
*   `IMS_FRONTEND/src/pages/masters/batch/components/AllBatches.jsx`
*   `IMS_FRONTEND/src/pages/masters/batch/components/EditBatch.jsx`
*   `IMS_FRONTEND/src/pages/masters/courses/Courses.jsx`
*   `IMS_FRONTEND/src/pages/masters/courses/components/AddCourse.jsx`
*   `IMS_FRONTEND/src/pages/masters/courses/components/AllCourses.jsx`
*   `IMS_FRONTEND/src/pages/masters/courses/components/EditCourse.jsx`
*   `IMS_FRONTEND/src/pages/masters/role/Role.jsx`
*   `IMS_FRONTEND/src/pages/masters/role/component/AddRole.jsx`
*   `IMS_FRONTEND/src/pages/masters/role/component/AllRoles.jsx`
*   `IMS_FRONTEND/src/pages/masters/role/component/EditRole.jsx`
*   `IMS_FRONTEND/src/pages/masters/session/Session.jsx`
*   `IMS_FRONTEND/src/pages/masters/session/components/AddSession.jsx`
*   `IMS_FRONTEND/src/pages/masters/session/components/AllSessions.jsx`
*   `IMS_FRONTEND/src/pages/masters/session/components/EditSession.jsx`
*   `IMS_FRONTEND/src/pages/masters/user/User.jsx`
*   `IMS_FRONTEND/src/pages/masters/user/Components/AddUser.jsx`
*   `IMS_FRONTEND/src/pages/masters/user/Components/AllUsers.jsx`
*   `IMS_FRONTEND/src/pages/masters/user/Components/EditUser.jsx`
*   `IMS_FRONTEND/src/pages/masters/user/Components/UserDetails.jsx`
*   `IMS_FRONTEND/src/pages/reports/Reports.jsx`
*   `IMS_FRONTEND/src/pages/student/Student.jsx`
*   `IMS_FRONTEND/src/pages/user/User.jsx`
*   `IMS_FRONTEND/src/pages/user/components/ChangePassword.jsx`
*   `IMS_FRONTEND/src/pages/user/components/Profile.jsx`
*   `IMS_FRONTEND/src/pages/user/components/Settings.jsx`
*   `IMS_FRONTEND/src/routes/AuthProtectedRoutes.jsx`
*   `IMS_FRONTEND/src/routes/ProtectedRoutes.jsx`
*   `IMS_FRONTEND/src/routes/RoleBasedRoutes.jsx`
*   `IMS_FRONTEND/src/services/API.jsx`
*   `IMS_FRONTEND/src/services/NotificationService.jsx`
*   `IMS_FRONTEND/src/store/index.js`
*   `IMS_FRONTEND/src/store/modules.json`
*   `IMS_FRONTEND/src/store/useRoleStore.js`
*   `IMS_FRONTEND/src/store/useSidebarStore.js`
*   `IMS_FRONTEND/src/store/useThemeStore.js`
*   `IMS_FRONTEND/src/store/useUserStore.js`
*   `IMS_FRONTEND/src/store/slices/themeSlice.js`
*   `IMS_FRONTEND/src/styles/styles.css`