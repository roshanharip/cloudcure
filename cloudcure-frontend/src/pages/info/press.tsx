import InfoPage from '@/pages/info';

export default function PressPage(): React.ReactElement {
    return (
        <InfoPage
            title="Press & Media"
            subtitle="Company"
            content={`CloudCure has been recognized as a category-defining platform in healthcare technology. This page provides resources for journalists, analysts, and media partners.

Media Kit: Our media kit includes CloudCure logos, product screenshots, executive headshots, and brand usage guidelines. All assets are cleared for editorial use with attribution.

Press Releases: All official CloudCure announcements, product launches, funding rounds, and partnership news are published on this page. Journalists may republish press releases in full with attribution.

Awards & Recognition: CloudCure has been recognized by leading industry analysts and publications including Gartner, KLAS, Modern Healthcare, and Healthcare IT News. A full list of awards is available in our media kit.

Analyst Relations: We maintain active relationships with leading healthcare IT analyst firms. For briefing requests, please contact our analyst relations team directly.

Speaking Engagements: Our executives and clinical advisors are available for keynote presentations, panel discussions, and podcast appearances on topics including digital health transformation, clinical AI, and healthcare data interoperability.

Press Inquiries: All media inquiries should be directed to our communications team. We aim to respond to all press requests within 24 business hours.`}
        />
    );
}
