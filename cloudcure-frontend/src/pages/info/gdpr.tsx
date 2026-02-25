import InfoPage from '@/pages/info';

export default function GdprPage(): React.ReactElement {
    return (
        <InfoPage
            title="GDPR Compliance"
            subtitle="Legal"
            content={`CloudCure is committed to full compliance with the General Data Protection Regulation (GDPR) for users and data subjects in the European Economic Area (EEA) and United Kingdom.

Data Controller & Processor: CloudCure acts as a data processor on behalf of healthcare organizations (data controllers) that use our platform to manage patient data. For personal data collected through our website and marketing activities, CloudCure acts as the data controller.

Legal Basis for Processing: We process personal data on the basis of contractual necessity (to deliver our services), legitimate interests (to improve and secure our platform), consent (for marketing and analytics), and legal obligation (for regulatory compliance and audit purposes).

Data Subject Rights: Under the GDPR, EEA and UK data subjects have the right to access, rectify, erase, restrict, or port their personal data. You also have the right to object to processing and to withdraw consent. Submit requests to compliance@cloudcure.io.

International Transfers: Personal data may be transferred to and processed in countries outside the EEA. For all such transfers, CloudCure implements appropriate safeguards including Standard Contractual Clauses approved by the European Commission.

Data Protection Officer: CloudCure has appointed a Data Protection Officer (DPO) who can be contacted at dpo@cloudcure.io for any GDPR-related queries or concerns.

Supervisory Authority: If you believe your data protection rights have been violated, you have the right to lodge a complaint with the supervisory authority in your country of residence.`}
        />
    );
}
