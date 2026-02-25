import InfoPage from '@/pages/info';

export default function IntegrationsPage(): React.ReactElement {
    return (
        <InfoPage
            title="Integrations"
            subtitle="Product"
            content={`CloudCure integrates natively with the tools and systems your practice already relies on — without complex setup or costly middleware.

EHR & Practice Management: Bidirectional integration with major EHR systems. Patient demographics, clinical notes, and encounter histories sync automatically, eliminating double entry.

Laboratory Systems: Connect to leading lab information systems to receive results directly in the patient timeline and trigger automated provider notifications.

Pharmacy Networks: Integration with national pharmacy networks allows prescriptions to be transmitted electronically and tracked to fulfillment.

Insurance & Billing: Built-in eligibility verification and claims submission connectors reduce billing errors and accelerate reimbursement cycles.

Wearables & Remote Monitoring: Ingest data from patient wearables and remote monitoring devices. Continuous vitals streams are surfaced in the patient dashboard and can trigger automated alerts.

API & Webhooks: CloudCure exposes a fully documented REST API and webhook framework so your engineering team can build custom integrations and automate workflows against your specific requirements.`}
        />
    );
}
