import InfoPage from '@/pages/info';

export default function CookiePolicyPage(): React.ReactElement {
    return (
        <InfoPage
            title="Cookie Policy"
            subtitle="Legal"
            content={`This Cookie Policy explains how CloudCure Inc. uses cookies and similar tracking technologies on our website and platform.

What Are Cookies: Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently and to provide reporting information to site operators.

Cookies We Use: We use strictly necessary cookies to enable core platform functionality (session management, authentication, security). We use functional cookies to remember your preferences and settings across sessions. We use analytics cookies (with your consent) to understand how users interact with our platform and improve it over time.

Third-Party Cookies: Some features of our platform may include content from third-party providers who may set their own cookies. We do not control third-party cookies and recommend reviewing those providers' policies.

Managing Cookies: You can control and delete cookies through your browser settings. Disabling strictly necessary cookies will impair core platform functionality. Disabling analytics cookies will not affect your ability to use the platform.

Cookie Consent: Where required by law, we obtain your consent before setting non-essential cookies. You can withdraw consent at any time through the cookie settings panel in your account preferences.

Updates to This Policy: We may update this Cookie Policy periodically. Continued use of the platform after an update constitutes acceptance of the revised policy.`}
        />
    );
}
