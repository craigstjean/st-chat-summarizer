import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2 text-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading...</p>
            </div>
        </div>
    );
} 