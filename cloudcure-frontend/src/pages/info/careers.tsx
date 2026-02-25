import InfoPage from '@/pages/info';

export default function CareersPage(): React.ReactElement {
    return (
        <InfoPage
            title="Careers at CloudCure"
            subtitle="Company"
            content={`We are building the operating system for modern healthcare. If you want your work to matter — to directly improve how millions of patients receive care — CloudCure is where you belong.

What We Offer: Competitive compensation with equity. Fully remote-first with optional in-person hubs in New York, London, and Bangalore. Comprehensive health coverage. Generous parental leave. An annual learning budget for every employee.

Engineering: We are hiring senior and staff engineers across backend (Node.js, Go), frontend (React, TypeScript), infrastructure (Kubernetes, AWS), and data engineering. We value engineers who think deeply about reliability, security, and user impact.

Design: We are looking for product designers and design engineers who want to rethink how clinical software looks and feels. Healthcare UI has been left behind for decades — you will help change that.

Clinical Informatics: We partner with clinicians, nurses, and health IT specialists to ensure our platform reflects real-world care workflows. If you have a clinical background and a passion for technology, we want to hear from you.

Growth & Operations: Roles in sales, customer success, marketing, finance, and legal. We are expanding across North America, Europe, and Asia Pacific.

Our Hiring Process: A brief introductory call, a focused take-home assessment relevant to your role, and a series of structured interviews with your future teammates. We aim to complete the process within three weeks.`}
        />
    );
}
