import InfoPage from '@/pages/info';

export default function SecurityPage(): React.ReactElement {
    return (
        <InfoPage
            title="Security"
            subtitle="Product"
            content={`Security is the foundation of CloudCure. Every architectural decision, engineering process, and deployment procedure is designed with security and compliance as a first principle.

Certifications & Compliance: CloudCure is SOC 2 Type II certified, HIPAA compliant, and ISO 27001 aligned. We undergo annual third-party penetration testing and security audits to validate our controls.

Data Encryption: All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Patient health information is segmented and access-controlled at the field level.

Zero-Trust Architecture: We enforce identity verification at every access point. No implicit trust is assumed — every request must be authenticated, authorized, and logged.

Multi-Factor Authentication: MFA is enforced for all administrative and clinical accounts. We support authenticator apps, SMS, and hardware security keys.

Audit Trails: Every action on patient data is logged with timestamp, user identity, and IP address. Audit logs are immutable and retained for a minimum of seven years.

Incident Response: Our security team operates a 24/7 security operations center. All incidents are escalated within 15 minutes, and affected parties are notified within 24 hours in accordance with applicable regulations.`}
        />
    );
}
