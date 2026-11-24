// Import required modules
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Create an instance of the Express app
const app = express();

// Import middleware
const errorMiddleware = require("./middlewares/error");
const auditMiddleware = require("./middlewares/auditMiddleware");

// Security middleware
// Configure Helmet with exceptions for Swagger UI
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true
}));

// HTTP request logging
if (process.env.NODE_ENV === "development") {
  // Detailed logging in development
  app.use(morgan("dev"));
} else {
  // Use combined format and log to Winston in production
  app.use(morgan("combined", { stream: logger.stream }));
}

// Limits each IP to 100 requests per 15 minutes on /api routes, protecting against DDoS or abuse.
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

// Middleware to parse JSON requests
app.use(express.json({ limit: "10kb" })); // Limit JSON payload size
app.use(cookieParser());

// Import API routes
const apiV1Routes = require("./api/v1/routes");

// Public CRM webhook — registered BEFORE audit middleware (no auth required)
const { publicWebhook } = require('./controllers/leadController');
app.post('/api/public/leads', publicWebhook);

// Apply audit middleware to all API routes
app.use('/api', auditMiddleware);

// Mount API routes with versioning
app.use("/api/v1", apiV1Routes);
const employeeTypeRoutes = require('./api/v1/routes/employeeTypeRoutes');
app.use('/api/EmpTypes', employeeTypeRoutes);
// app.use('/api/v1/enquiry', enquiryRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Serve frontend static files
// Set static folder - update path to point to Vite's output directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// API Documentation route with Swagger UI - publicly accessible
// Make sure Swagger UI is served before the catch-all route
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "User Auth API Documentation"
}));

// Serve index.html for any route not matching API routes or Swagger UI
// app.get("*", (_, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
// });

// Middleware for handling errors
app.use(errorMiddleware); // Use error handling middleware to catch and handle errors

// Export the Express app
module.exports = app;
