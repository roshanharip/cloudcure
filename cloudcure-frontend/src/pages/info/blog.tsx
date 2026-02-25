import InfoPage from '@/pages/info';

export default function BlogPage(): React.ReactElement {
    return (
        <InfoPage
            title="CloudCure Blog"
            subtitle="Company"
            content={`The CloudCure blog is where our team shares insights on healthcare technology, clinical workflows, regulatory compliance, and product updates.

Clinical Informatics: In-depth articles on how digital tools are reshaping clinical decision-making, documentation standards, and patient engagement across specialties.

Compliance & Regulation: Plain-language guides to navigating HIPAA, GDPR, and evolving healthcare data regulations. Written by our in-house compliance team for practicing clinicians and administrators.

Product Updates: Detailed release notes and feature walkthroughs. We publish notes for every platform update, including API changes, new integrations, and UI improvements.

Customer Stories: Real-world case studies from CloudCure customers sharing how they improved efficiency, reduced costs, or elevated care quality using the platform.

Engineering: Our engineering blog covers the technical challenges of building HIPAA-compliant distributed systems at scale — including our approaches to data encryption, real-time sync, and zero-downtime deployments.

Subscribe to receive new articles directly in your inbox. We publish two to three times per week and never share subscriber information with third parties.`}
        />
    );
}
