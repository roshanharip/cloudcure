import InfoPage from '@/pages/info';

export default function TermsPage(): React.ReactElement {
    return (
        <InfoPage
            title="Terms of Service"
            subtitle="Legal"
            content={`These Terms of Service ("Terms") govern your access to and use of the CloudCure platform and related services ("Services") provided by CloudCure Inc. ("CloudCure"). By accessing the Services, you agree to be bound by these Terms.

Account Responsibilities: You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify CloudCure immediately of any unauthorized access.

Acceptable Use: You may use the Services only for lawful purposes and in accordance with these Terms. You may not use the Services to transmit unlawful content, attempt to gain unauthorized access to other accounts or systems, or interfere with the operation of the platform.

Subscription and Payment: Subscription fees are billed in advance on a monthly or annual basis depending on your plan. All fees are non-refundable except as required by applicable law or as expressly stated in your order form.

Intellectual Property: CloudCure retains all rights, title, and interest in the platform and Services. You are granted a limited, non-exclusive, non-transferable license to use the Services during your subscription term.

Limitation of Liability: To the maximum extent permitted by law, CloudCure's liability for any claim arising from these Terms or the Services is limited to the fees paid by you in the twelve months preceding the claim.

Governing Law: These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law principles. Any disputes shall be resolved by binding arbitration in Delaware.`}
        />
    );
}
