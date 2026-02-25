import InfoPage from '@/pages/info';

export default function PricingPage(): React.ReactElement {
    return (
        <InfoPage
            title="Pricing"
            subtitle="Product"
            content={`CloudCure offers flexible pricing to fit practices of every size — from solo practitioners to enterprise hospital networks.

Starter Plan: Designed for independent providers and small clinics. Includes core scheduling, basic EHR, and patient messaging for up to 3 providers. Priced per seat per month with no setup fees.

Professional Plan: For growing practices that need advanced analytics, e-prescriptions, and telehealth. Includes unlimited appointments and priority support.

Enterprise Plan: Custom pricing for hospital networks, multi-site medical groups, and health systems. Includes dedicated infrastructure, SSO, role-based access, SLA guarantees, and a dedicated customer success manager.

All plans include: 99.9% uptime SLA, HIPAA-compliant data handling, free onboarding assistance, and 24/7 technical support. No long-term contracts required — cancel anytime.

Contact our sales team for a tailored quote or to schedule a live demo of the platform.`}
        />
    );
}
