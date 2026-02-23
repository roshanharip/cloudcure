# CloudCure - Enterprise Health Management System

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

## 📋 Overview

CloudCure is an enterprise-grade healthcare management system built with NestJS, featuring comprehensive authentication, role-based access control, and complete API documentation. Designed for scalability, security, and maintainability.

## ✨ Features

### 🔐 Enterprise Authentication & Authorization
- **JWT-based Authentication** with access (15min) and refresh tokens (7 days)
- **HttpOnly Cookie Sessions** for XSS protection
- **Token Rotation** on every refresh for enhanced security
- **BCrypt Hashing** for passwords and refresh tokens
- **Google OAuth 2.0** integration
- **Role-Based Access Control (RBAC)**: Admin, Doctor, Patient

### 🛡️ Security
- **Helmet** - Security headers
- **Rate Limiting** - DDoS protection
- **CORS** - Configured cross-origin policies
- **Strong Password Validation** - 8+ chars, uppercase, lowercase, numbers, symbols
- **Refresh Token Hashing** - Database compromise protection

### 📝 Validation & DTOs
- **Strong Password Rules** via `@IsStrongPassword`
- **Custom Validators** - Password confirmation matching
- **Comprehensive Error Messages** - User-friendly validation feedback
- **Type-Safe DTOs** - Full TypeScript strict mode compliance

### 📚 API Documentation
- **Swagger/OpenAPI** - Complete interactive API docs at `/api/docs`
- **Request/Response Types** - All endpoints fully documented
- **Authentication Examples** - Bearer token and cookie auth
- **Standardized Responses** - All endpoints return `BaseResponse<T>` format

### 🏗️ Architecture
- **Modular Structure** - Feature-based modules (Auth, Users, Doctors, Patients, Medical Records, Prescriptions)
- **Centralized Models** - `ModelsModule` for schema management
- **Path Aliases** - `@src`, `@modules`, `@common` for clean imports
- **Global Error Handling** - `AllExceptionsFilter` with structured error responses
- **Transform Interceptor** - Auto-wraps responses in `BaseResponse<T>`
- **Pagination Support** - Built-in pagination for list endpoints

### 🗄️ Database
- **MongoDB Atlas** with Mongoose ODM
- **Schema Validation** - Mongoose schemas with timestamps
- **Indexed Fields** - Optimized queries for email, role, etc.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS 11.x
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT, Passport, Google OAuth
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, bcrypt, cookie-parser
- **Package Manager**: pnpm
- **Linting**: ESLint, Prettier
- **Git Hooks**: Husky

## 📦 Installation

```bash
# Install dependencies
pnpm install
```

## ⚙️ Environment Variables

Create environment files in `envs/` directory:

### `.env.development`
```env
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudcure?retryWrites=true&w=majority

# JWT Secrets (use different secrets for access and refresh)
JWT_SECRET=your-super-secret-jwt-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-this

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

### `.env.production`
```env
NODE_ENV=production
PORT=3000
# ... same structure with production values
```

> **Security Note**: Never commit `.env` files to version control. Use different secrets for each environment.

## 🏃 Running the Application

```bash
# Development mode (with hot reload)
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The API will be available at:
- **API Base**: `http://localhost:3000/api/v1`
- **Swagger Docs**: `http://localhost:3000/api/docs`

## 📖 API Documentation

### Base Response Format
All endpoints return responses in this standardized format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-01-25T23:39:51Z"
}
```

### Authentication Endpoints

#### `POST /api/v1/auth/register`
Register a new user with password confirmation.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

#### `POST /api/v1/auth/login`
Login and receive access token + HttpOnly refresh cookie.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT",
      "isActive": true
    }
  },
  "timestamp": "2026-01-25T23:39:51Z"
}
```

#### `POST /api/v1/auth/refresh`
Get new access token using refresh token from cookie.

#### `POST /api/v1/auth/logout`
Invalidate refresh token and clear cookie. Requires Bearer token.

#### `GET /api/v1/auth/google`
Initiate Google OAuth flow.

For complete API documentation, visit `/api/docs` when the server is running.

## 📁 Project Structure

```
cloudcure/
├── src/
│   ├── common/               # Shared utilities
│   │   ├── decorators/       # Custom decorators
│   │   ├── enums/            # Enums (Role, etc.)
│   │   ├── filters/          # Exception filters
│   │   ├── guards/           # Auth guards
│   │   ├── interceptors/     # Transform interceptor
│   │   ├── interfaces/       # BaseResponse, BasePagination
│   │   └── validators/       # Custom validators (@Match)
│   ├── config/               # Configuration modules
│   │   ├── database.module.ts
│   │   ├── models.module.ts
│   │   └── swagger.config.ts
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication
│   │   ├── users/            # User management
│   │   ├── doctors/          # Doctor profiles
│   │   ├── patients/         # Patient records
│   │   ├── medical-records/  # Medical records
│   │   └── prescriptions/    # Prescription management
│   ├── app.module.ts
│   └── main.ts
├── envs/                     # Environment files
├── test/                     # E2E tests
└── README.md
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 🔍 Code Quality

```bash
# Lint and auto-fix
pnpm run lint

# Format code
pnpm run format

# Type checking
pnpm run build
```

**Standards:**
- ✅ TypeScript strict mode enabled
- ✅ Zero lint errors/warnings
- ✅ Consistent code formatting (Prettier)
- ✅ Pre-commit hooks (Husky)

## 🎯 Validation Examples

### Strong Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 symbol

### Error Response Example
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 400,
    "message": [
      "Password must be at least 8 characters with uppercase, lowercase, number, and symbol",
      "Passwords do not match"
    ]
  },
  "timestamp": "2026-01-25T23:39:51Z"
}
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **Password Hashing**: BCrypt with salt rounds of 10
3. **JWT Secrets**: Use different secrets for access and refresh tokens
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Prevents brute force attacks
6. **HttpOnly Cookies**: Refresh tokens stored in HttpOnly cookies
7. **CORS**: Configured for specific origins in production

## 📜 License

This project is [MIT licensed](LICENSE).

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

**Built with ❤️ using NestJS**
