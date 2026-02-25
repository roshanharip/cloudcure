import InfoPage from '@/pages/info';

export default function PrivacyPage(): React.ReactElement {
    return (
        <InfoPage
            title="Privacy Policy"
            subtitle="Legal"
            content={`This Privacy Policy describes how CloudCure Inc. ("CloudCure", "we", "us", or "our") collects, uses, and protects information in connection with our services.

Information We Collect: We collect information you provide directly (account credentials, profile information, payment details) and information generated through your use of the platform (usage logs, audit trails, preferences). We do not sell personal information to third parties.

Health Information: CloudCure operates as a HIPAA Business Associate for covered healthcare entities. Protected Health Information (PHI) processed through our platform is handled in strict compliance with HIPAA regulations and the terms of applicable Business Associate Agreements.

How We Use Information: We use collected information to provide, operate, and improve our services; to communicate with you about your account and our products; to detect and prevent fraud and security incidents; and to comply with applicable legal obligations.

Data Sharing: We may share information with service providers who assist in operating our platform (cloud infrastructure, payment processors, support tools) under strict data processing agreements. We disclose information when required by law or to protect the safety and rights of our users.

Data Retention: We retain account data for the duration of your subscription and for a period thereafter as required by applicable law. PHI is retained in accordance with your organization's retention schedule and applicable regulations.

Your Rights: Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. Contact compliance@cloudcure.io to exercise these rights.`}
        />
    );
}
