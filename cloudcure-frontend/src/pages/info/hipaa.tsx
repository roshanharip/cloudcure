import InfoPage from '@/pages/info';

export default function HipaaPage(): React.ReactElement {
    return (
        <InfoPage
            title="HIPAA Policy"
            subtitle="Legal"
            content={`CloudCure is designed, operated, and maintained in full compliance with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and its implementing regulations, including the HIPAA Privacy Rule, Security Rule, and Breach Notification Rule.

Business Associate Agreement: CloudCure enters into a Business Associate Agreement (BAA) with all covered entity customers before any Protected Health Information (PHI) may be transmitted through the platform. BAAs are available as a standard addendum to the CloudCure Master Services Agreement.

PHI Handling: CloudCure processes PHI only as directed by covered entity customers and only for the purposes specified in the applicable BAA. We do not use or disclose PHI for our own commercial purposes.

Technical Safeguards: The platform implements all required and addressable HIPAA Security Rule technical safeguards, including access controls, audit controls, integrity controls, person or entity authentication, and transmission security.

Administrative Safeguards: CloudCure maintains a comprehensive HIPAA compliance program including designated privacy and security officers, workforce training, access management procedures, and incident response protocols.

Physical Safeguards: Our infrastructure is hosted in HIPAA-eligible cloud environments with physical access controls, workstation use policies, and device and media controls in place.

Breach Notification: In the event of a breach of unsecured PHI, CloudCure will notify affected covered entities within the timeframes required by the HIPAA Breach Notification Rule.`}
        />
    );
}
