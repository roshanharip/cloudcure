import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ProfileCompletionBanner() {
    const { percentage, missingFields, isComplete, isLoading } = useProfileCompletion();

    if (isLoading || isComplete) return null;

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-medium">
                            <AlertCircle className="h-4 w-4" />
                            <span>Complete your profile to be visible to patients</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2 bg-yellow-200 dark:bg-yellow-800" indicatorClassName="bg-yellow-600 dark:bg-yellow-400" />
                    {missingFields.length > 0 && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                            Missing: {missingFields.join(', ')}
                        </p>
                    )}
                </div>
                <Button asChild size="sm" variant="outline" className="whitespace-nowrap bg-white dark:bg-black border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100">
                    <Link to="/profile">
                        Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
