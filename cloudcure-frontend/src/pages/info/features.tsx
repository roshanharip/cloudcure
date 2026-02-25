import InfoPage from '@/pages/info';

export default function FeaturesPage(): React.ReactElement {
    return (
        <InfoPage
            title="Platform Features"
            subtitle="Product"
            content={`CloudCure is a comprehensive healthcare management platform built for modern medical practices of all sizes. Our feature set is designed by clinicians, for clinicians — reducing administrative burden while elevating patient care.

Smart Scheduling: Our AI-powered scheduling engine eliminates double bookings, sends automated reminders, and reduces no-show rates by up to 40%. It integrates directly with provider calendars and adjusts availability in real time.

Digital Medical Records: Store, search, and share patient records securely. Every record is versioned, encrypted at rest and in transit, and accessible only by authorized personnel. Our full-text search finds what you need in milliseconds.

Prescription Management: Issue electronic prescriptions directly to pharmacies with built-in drug interaction checking. Automate refill reminders and track prescription history across encounters.

Secure Messaging: HIPAA-compliant end-to-end encrypted chat between patients and providers. Share images, lab results, and documents in a private, auditable conversation thread.

Real-Time Analytics: Live operational dashboards give administrators visibility into appointment volumes, provider utilization, revenue cycle metrics, and patient satisfaction scores — all in one place.

Video Consultations: Integrated telehealth module with HD video, screen sharing, and session recording. No third-party app required — patients join from their browser.`}
        />
    );
}
