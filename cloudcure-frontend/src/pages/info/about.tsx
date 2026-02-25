import InfoPage from '@/pages/info';

export default function AboutPage(): React.ReactElement {
    return (
        <InfoPage
            title="About CloudCure"
            subtitle="Company"
            content={`CloudCure was founded with a single conviction: healthcare delivery should be limited only by clinical expertise, not administrative friction. We build software that removes the operational burden from healthcare providers so they can focus entirely on patient outcomes.

Our Mission: To modernize healthcare management infrastructure for every provider — from independent clinicians to global hospital networks — through secure, intelligent, and beautifully designed software.

Our Story: CloudCure was started by a team of physicians, engineers, and healthcare administrators who experienced firsthand the inefficiencies that legacy systems impose on modern care delivery. We set out to build the platform we always wished existed.

Our Team: We are a distributed team of over 200 professionals spanning engineering, design, clinical informatics, compliance, and customer success. Our leadership team has decades of combined experience at leading healthcare organizations and technology companies.

Our Values: We believe in radical transparency, patient-first design, and uncompromising security. Every feature we ship is validated against real clinical workflows before it reaches production.

Our Impact: Thousands of providers across 140 countries trust CloudCure to manage millions of patient encounters every month. We measure our success by the quality of care our customers deliver.`}
        />
    );
}
