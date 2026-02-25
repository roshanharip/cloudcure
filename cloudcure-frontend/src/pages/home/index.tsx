import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import {
    Stethoscope,
    FileText,
    Calendar,
    ChevronRight,
    CheckCircle2,
    Activity,
    Users,
    Star,
    ArrowUpRight,
    HeartPulse,
    Brain,
    Microscope,
    MessageSquare,
    Lock,
    Zap,
    Globe,
    Menu,
    X,
    Shield,
    ArrowRight,
} from 'lucide-react';
import { ROUTES, APP_CONFIG } from '@/constants';

interface StatItem {
    value: string;
    label: string;
    suffix?: string;
}

interface FeatureItem {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

interface TestimonialItem {
    name: string;
    role: string;
    text: string;
    avatar: string;
    rating: number;
}

const stats: StatItem[] = [
    { value: '50', label: 'Healthcare Providers', suffix: 'K+' },
    { value: '2', label: 'Patients Served', suffix: 'M+' },
    { value: '99.9', label: 'Uptime SLA', suffix: '%' },
    { value: '140', label: 'Countries', suffix: '+' },
];

const features: FeatureItem[] = [
    {
        icon: Calendar,
        title: 'Smart Scheduling',
        description: 'AI-powered appointment management that eliminates double bookings and reduces no-shows by up to 40%.',
    },
    {
        icon: FileText,
        title: 'Digital Medical Records',
        description: 'HIPAA-compliant electronic health records with real-time access, audit trails, and smart search.',
    },
    {
        icon: MessageSquare,
        title: 'Secure Messaging',
        description: 'End-to-end encrypted consultations between patients and doctors, supporting text, images, and video.',
    },
    {
        icon: Activity,
        title: 'Real-Time Analytics',
        description: 'Live dashboards surfacing patient outcomes, revenue cycles, and operational KPIs across every department.',
    },
    {
        icon: Lock,
        title: 'Enterprise Security',
        description: 'SOC 2 Type II certified with zero-trust architecture, MFA, and automated threat detection.',
    },
    {
        icon: Zap,
        title: 'Instant Prescriptions',
        description: 'Digital e-prescriptions sent directly to pharmacies with drug interaction checking and refill reminders.',
    },
];

const testimonials: TestimonialItem[] = [
    {
        name: 'Dr. Sarah Mitchell',
        role: 'Chief Medical Officer, NovaCare',
        text: 'CloudCure transformed how we deliver care. Our appointment no-show rate dropped 38% in just three months.',
        avatar: 'SM',
        rating: 5,
    },
    {
        name: 'James Okafor',
        role: 'VP of Operations, MedGroup',
        text: 'The analytics alone justified the investment. We now make data-driven decisions across all 22 of our clinics.',
        avatar: 'JO',
        rating: 5,
    },
    {
        name: 'Dr. Priya Nair',
        role: 'Cardiologist, HorizonHealth',
        text: 'Patient engagement is at an all-time high. The secure messaging feature has been a game changer for follow-ups.',
        avatar: 'PN',
        rating: 5,
    },
];

const specialties = [
    { icon: HeartPulse, label: 'Cardiology' },
    { icon: Brain, label: 'Neurology' },
    { icon: Microscope, label: 'Pathology' },
    { icon: Stethoscope, label: 'General' },
    { icon: Users, label: 'Pediatrics' },
    { icon: Globe, label: 'Telemedicine' },
];

const footerLinks = {
    Product: [
        { label: 'Features', to: '/features' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Security', to: '/security' },
        { label: 'Integrations', to: '/integrations' },
        { label: 'API Docs', to: '/api-docs' },
    ],
    Company: [
        { label: 'About Us', to: '/about' },
        { label: 'Blog', to: '/blog' },
        { label: 'Careers', to: '/careers' },
        { label: 'Press', to: '/press' },
        { label: 'Contact', to: '/contact' },
    ],
    Legal: [
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'HIPAA Policy', to: '/hipaa' },
        { label: 'Cookie Policy', to: '/cookies' },
        { label: 'GDPR', to: '/gdpr' },
    ],
};

function useCountUp(target: number, duration: number = 1800, start: boolean = false): number {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (timestamp: number): void => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(target);
            }
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);

    return count;
}

function CountUpStat({ stat, start }: { stat: StatItem; start: boolean }): React.ReactElement {
    const numericValue = parseFloat(stat.value.replace(/,/g, ''));
    const count = useCountUp(numericValue, 1800, start);
    const displayValue = Number.isInteger(numericValue) ? count.toString() : count.toFixed(1);

    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-50 animate-[gradientShift_6s_ease_infinite] bg-clip-text">
                {displayValue}
                <span className="text-3xl md:text-4xl">{stat.suffix}</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {stat.label}
            </p>
        </div>
    );
}

/**
 * CloudCure Landing Page
 * Black & white monochrome design with gradient text animations and transitions
 */
export default function LandingPage(): React.ReactElement {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = (): void => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setStatsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased overflow-x-hidden">

            {/* ─── HEADER ─────────────────────────────────────────────────── */}
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
                        ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800'
                        : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-black text-sm group-hover:scale-105 transition-transform duration-200">
                            C
                        </div>
                        <span className="font-bold text-lg tracking-tight">{APP_CONFIG.NAME}</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Features', href: '#features' },
                            { label: 'Specialties', href: '#specialties' },
                            { label: 'Testimonials', href: '#testimonials' },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to={ROUTES.LOGIN}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                        >
                            Sign In
                        </Link>
                        <Link
                            to={ROUTES.REGISTER}
                            className="px-5 py-2 text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all duration-200 hover:-translate-y-px"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                        } bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800`}
                >
                    <div className="px-6 py-4 space-y-3">
                        {['Features', 'Specialties', 'Testimonials'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-3 flex flex-col gap-2 border-t border-zinc-100 dark:border-zinc-800">
                            <Link to={ROUTES.LOGIN} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1">
                                Sign In
                            </Link>
                            <Link
                                to={ROUTES.REGISTER}
                                className="px-4 py-2 text-sm font-bold text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── HERO ───────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Animated radial gradient background */}
                <div className="absolute inset-0 bg-white dark:bg-zinc-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,0,0,0.06)_0%,transparent_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.06)_0%,transparent_100%)]" />

                {/* Animated noise/grain blobs in greyscale */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-zinc-100 dark:bg-zinc-900 opacity-70 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-zinc-100 dark:bg-zinc-900 opacity-50 blur-3xl animate-[pulse_14s_ease-in-out_infinite_3s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-zinc-200 dark:bg-zinc-800 opacity-30 blur-3xl animate-[pulse_18s_ease-in-out_infinite_6s]" />
                </div>

                {/* Fine dot grid */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-8 animate-[fadeInDown_0.6s_ease-out]">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
                        Enterprise Healthcare Platform · HIPAA Compliant
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] animate-[fadeInDown_0.7s_ease-out]">
                        The Future of
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-500 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-white bg-[length:200%_100%] animate-[gradientShift_5s_ease_infinite]">
                            Healthcare
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-8 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-[fadeInDown_0.8s_ease-out]">
                        CloudCure unifies scheduling, medical records, prescriptions, and patient communication
                        in one secure, intelligent platform trusted by leading hospitals worldwide.
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeInDown_0.9s_ease-out]">
                        <Link
                            to={ROUTES.REGISTER}
                            className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-lg shadow-zinc-900/10 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Start Free Trial
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </Link>
                        <Link
                            to={ROUTES.LOGIN}
                            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Sign In to Dashboard
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-zinc-400 animate-[fadeInDown_1s_ease-out]">
                        {['No credit card required', 'SOC 2 Type II', 'HIPAA Compliant', '24/7 Support'].map((item) => (
                            <span key={item} className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Hero mockup */}
                    <div className="mt-20 relative max-w-4xl mx-auto animate-[fadeInUp_1s_ease-out]">
                        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-black/5 dark:shadow-black/40 bg-white dark:bg-zinc-900">
                            {/* Fake browser bar */}
                            <div className="h-10 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2 px-4">
                                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                <div className="ml-4 flex-1 h-5 rounded-md bg-zinc-200 dark:bg-zinc-700 max-w-xs" />
                            </div>
                            {/* Dashboard preview */}
                            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 grid grid-cols-3 gap-4 min-h-48">
                                {[
                                    { label: 'Active Patients', value: '2,847', change: '+12%' },
                                    { label: 'Appointments Today', value: '143', change: '+8%' },
                                    { label: 'Avg. Wait Time', value: '4.2 min', change: '-18%' },
                                ].map((card) => (
                                    <div
                                        key={card.label}
                                        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm"
                                    >
                                        <p className="text-xs text-zinc-400 truncate">{card.label}</p>
                                        <p className="text-xl font-black mt-1 text-zinc-900 dark:text-zinc-50">{card.value}</p>
                                        <span className="text-xs font-semibold text-zinc-500">{card.change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating badge — HIPAA */}
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden lg:flex animate-[float_6s_ease-in-out_infinite]">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xl px-4 py-3 flex items-center gap-2.5 w-48">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Shield className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">HIPAA Verified</p>
                                    <p className="text-[10px] text-zinc-400">Highest security</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge — Uptime */}
                        <div className="absolute -right-6 bottom-8 hidden lg:flex animate-[float_8s_ease-in-out_infinite_2s]">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xl px-4 py-3 flex items-center gap-2.5 w-48">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Activity className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">99.9% Uptime</p>
                                    <p className="text-[10px] text-zinc-400">Enterprise SLA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── STATS ──────────────────────────────────────────────────── */}
            <section
                ref={statsRef}
                className="py-20 border-y border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        {stats.map((stat) => (
                            <CountUpStat key={stat.label} stat={stat} start={statsVisible} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ───────────────────────────────────────────────── */}
            <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-950/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            Platform Capabilities
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                            Everything your practice needs
                        </h2>
                        <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-lg">
                            Designed for clinicians, administrators, and patients — all within one secure environment.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5 group-hover:bg-zinc-900 dark:group-hover:bg-white transition-colors duration-300">
                                        <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-base font-bold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-all duration-200">
                                        Learn more <ArrowUpRight className="h-3 w-3" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── SPECIALTIES ────────────────────────────────────────────── */}
            <section id="specialties" className="py-24 bg-white dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-xl mx-auto mb-14">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            Medical Specialties
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                            Built for every specialty
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {specialties.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-400 hover:bg-zinc-900 dark:hover:bg-white transition-all duration-300 cursor-default"
                            >
                                <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-800 dark:group-hover:bg-zinc-200 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                                    <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-300" />
                                </div>
                                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-300">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ───────────────────────────────────────────── */}
            <section id="testimonials" className="py-24 bg-zinc-50 dark:bg-zinc-950/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-xl mx-auto mb-14">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            Social Proof
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                            Trusted by healthcare leaders
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {Array.from({ length: t.rating }).map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white" />
                                    ))}
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div className="mt-5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 text-xs font-black shrink-0">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{t.name}</p>
                                        <p className="text-xs text-zinc-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ────────────────────────────────────────────────────── */}
            <section className="py-28 relative overflow-hidden bg-zinc-950 dark:bg-white">
                {/* Animated gradient sweep */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(255,255,255,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(0,0,0,0.04)_0%,transparent_70%)] animate-[pulse_8s_ease-in-out_infinite]" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                        backgroundSize: '36px 36px',
                    }}
                />

                <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-6xl font-black text-white dark:text-zinc-900 tracking-tighter leading-tight">
                        Ready to modernize
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white dark:from-zinc-900 dark:via-zinc-500 dark:to-zinc-900 bg-[length:200%_100%] animate-[gradientShift_5s_ease_infinite]">
                            your practice?
                        </span>
                    </h2>
                    <p className="mt-6 text-zinc-400 dark:text-zinc-500 text-lg max-w-xl mx-auto">
                        Join thousands of healthcare providers using CloudCure to deliver better care, faster.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={ROUTES.REGISTER}
                            className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
                        >
                            Create Free Account
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            to={ROUTES.LOGIN}
                            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white dark:text-zinc-900 border border-white/20 dark:border-zinc-900/20 rounded-xl hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {/* Brand */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-black text-xs">
                                    C
                                </div>
                                <span className="font-black tracking-tight">{APP_CONFIG.NAME}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                {APP_CONFIG.DESCRIPTION}
                            </p>
                            <p className="mt-4 text-xs text-zinc-400">
                                © {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.
                            </p>
                        </div>

                        {/* Footer link groups */}
                        {Object.entries(footerLinks).map(([group, links]) => (
                            <div key={group}>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5">{group}</h4>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                to={link.to}
                                                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-150"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-14 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-zinc-400">Built for healthcare. Trusted worldwide.</span>
                        <div className="flex items-center gap-4">
                            {['SOC 2', 'HIPAA', 'GDPR', 'ISO 27001'].map((cert) => (
                                <span
                                    key={cert}
                                    className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider"
                                >
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
