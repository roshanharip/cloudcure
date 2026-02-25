import InfoPage from '@/pages/info';

export default function ApiDocsPage(): React.ReactElement {
    return (
        <InfoPage
            title="API Documentation"
            subtitle="Product"
            content={`The CloudCure REST API gives developers programmatic access to the full platform. Build custom workflows, integrate with enterprise systems, or extend the platform to fit your unique clinical environment.

Authentication: All API requests are authenticated using OAuth 2.0 bearer tokens. Access tokens are scoped to specific resources and expire after a configurable duration. Refresh tokens allow seamless session continuation.

Base URL: All API endpoints are served from a dedicated subdomain. Versioning is handled via the URL path (e.g., /v1/, /v2/) to ensure backward compatibility as the API evolves.

Core Resources: The API exposes resources for patients, appointments, providers, medical records, prescriptions, messages, and notifications. Each resource supports standard CRUD operations plus domain-specific actions.

Rate Limiting: API calls are rate-limited per token and per IP. Limits are communicated in response headers and documented per endpoint. Enterprise customers receive elevated limits.

Webhooks: Subscribe to real-time event notifications for appointment changes, prescription submissions, new messages, and other platform events. Webhook deliveries include retry logic with exponential backoff.

SDKs: Official client libraries are available for JavaScript/TypeScript, Python, and Go. Community-maintained SDKs exist for Ruby and Java. All SDKs are open-source and hosted on GitHub.`}
        />
    );
}
