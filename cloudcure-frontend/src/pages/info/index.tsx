import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '@/constants';

interface InfoPageProps {
    title: string;
    subtitle: string;
    content: string;
}

/**
 * Generic informational page for public footer routes (Legal, Company, Product)
 */
export default function InfoPage({ title, subtitle, content }: InfoPageProps): React.ReactElement {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs group-hover:opacity-80 transition-opacity">
                            C
                        </div>
                        <span className="font-bold tracking-tight">{APP_CONFIG.NAME}</span>
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-16">
                <div className="mb-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{subtitle}</p>
                    <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
                    <p className="mt-2 text-sm text-zinc-400">Last updated: February 2026</p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-[15px]">
                        {content.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">© {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.</span>
                    <Link
                        to="/contact"
                        className="text-xs font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
                    >
                        Contact us
                    </Link>
                </div>
            </main>
        </div>
    );
}
