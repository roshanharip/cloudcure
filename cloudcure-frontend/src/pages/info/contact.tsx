import InfoPage from '@/pages/info';

export default function ContactPage(): React.ReactElement {
    return (
        <InfoPage
            title="Contact Us"
            subtitle="Company"
            content={`We are here to help. Whether you are a current customer, prospective client, or a member of the press, there is a dedicated team ready to assist you.

Sales & Demos: Interested in CloudCure for your practice or health system? Our sales team can arrange a live demonstration tailored to your specialty and scale. Reach us at sales@cloudcure.io or use the account signup flow to request a trial.

Customer Support: Existing customers can access support through the Help Center inside the platform, or by emailing support@cloudcure.io. Enterprise customers have access to a dedicated customer success manager and a priority support queue with response times measured in minutes.

Technical Support: For API issues, integration questions, or infrastructure concerns, our technical support team is available around the clock. Documentation and status updates are available at status.cloudcure.io.

Billing: For questions about invoices, subscription changes, or payment methods, contact billing@cloudcure.io.

Compliance & Privacy: For data subject access requests, HIPAA business associate agreement inquiries, or security disclosures, contact compliance@cloudcure.io. We respond to all compliance matters within one business day.

General Inquiries: For all other questions, use the general contact form on our website or email hello@cloudcure.io.`}
        />
    );
}
