import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CloudCure API')
    .setDescription(
      `
# CloudCure Healthcare Management System API

Enterprise-grade REST API for healthcare management with authentication, authorization, and data management.

## Features
- 🔐 JWT Authentication with refresh tokens
- 🍪 HttpOnly cookie sessions
- 👥 Role-Based Access Control (RBAC)
- 📊 Comprehensive medical records management
- 💊 Prescription tracking
- 📄 Complete API documentation

## Authentication

### Option 1: Bearer Token (Recommended)
1. Login via \`POST /api/v1/auth/login\`
2. Copy the \`accessToken\` from response
3. Click the **🔓 Authorize** button above
4. Enter: \`Bearer <your_access_token>\`
5. Click **Authorize**

**The token will be automatically stored and used for all requests!**

### Option 2: Cookie-based (For browsers)
After login, refresh token is stored in HttpOnly cookie automatically.

## Test Credentials
- **Admin**: admin@cloudcure.com / Admincloudcure@1
- **Patient**: Register via \`POST /auth/register\`

## Response Format
All responses follow this structure:
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-01-26T00:05:38Z"
}
\`\`\`
      `.trim(),
    )
    .setVersion('1.0.0')
    .setContact(
      'CloudCure Support',
      'https://cloudcure.com',
      'support@cloudcure.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.cloudcure.com', 'Production Server')
    // JWT Bearer Authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name must match @ApiBearerAuth() decorators
    )
    // Cookie Authentication (for refresh tokens)
    .addCookieAuth(
      'Refresh-Token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'Refresh-Token',
        description: 'Refresh token stored in HttpOnly cookie',
      },
      'cookie-auth',
    )
    // Tags for organization
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management operations')
    .addTag('Admin', 'Admin-only operations (requires ADMIN role)')
    .addTag('Doctors', 'Doctor profile management')
    .addTag('Patients', 'Patient profile management')
    .addTag('Medical Records', 'Medical records and health data')
    .addTag('Prescriptions', 'Prescription management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      // Auto-persist authorization token
      persistAuthorization: true,
      // Display request duration
      displayRequestDuration: true,
      // Show extensions
      showExtensions: true,
      // Show common extensions
      showCommonExtensions: true,
      // Filter by tags
      filter: true,
      // Try it out enabled by default
      tryItOutEnabled: true,
      // Request snippets for different languages
      requestSnippetsEnabled: true,
      // Syntax highlighting theme
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      // Deep linking
      deepLinking: true,
      // Display operation ID
      displayOperationId: false,
      // Default models expand depth
      defaultModelsExpandDepth: 3,
      // Default model expand depth
      defaultModelExpandDepth: 3,
      // Default models rendering
      defaultModelRendering: 'model',
      // Doc expansion
      docExpansion: 'list',
      // Validation on properties
      validatorUrl: null,
    },
    customSiteTitle: 'CloudCure API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 36px; }
      .swagger-ui .scheme-container { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
    `,
  });
}
