"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { toast } from "@/hooks/use-toast";
import { ClipboardCopy } from 'lucide-react';

export function CharacterSummaryDialog({ summaryArray = [], isOpen, setIsOpen }) {
    const [selectedSummaryIndex, setSelectedSummaryIndex] = useState(0);

    // Reorganize array to put final summary first
    const reorganizedSummaries = summaryArray.length > 0
        ? [
            summaryArray[summaryArray.length - 1], // Final summary first
            ...summaryArray.slice(0, -1) // Then the rest in original order
        ]
        : [];

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(reorganizedSummaries[selectedSummaryIndex]);
            toast({ title: 'Summary', description: 'Copied to clipboard' })
        } catch (err) {
            toast({ title: 'Summary', description: 'Failed to copy to clipboard' })
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="h-[75vh] max-w-[90vw] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Character Summary</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 grid grid-cols-[300px_1fr] gap-4 flex-1 overflow-hidden">
                        {/* Left column - Summary parts list */}
                        <div className="border-r pr-4 overflow-y-auto">
                            <ul className="space-y-2">
                                {reorganizedSummaries.map((summary, index) => (
                                    <li
                                        key={index}
                                        className={`p-2 rounded-md cursor-pointer transition-colors
                                            ${index === selectedSummaryIndex
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary hover:bg-secondary/80'}`}
                                        onClick={() => setSelectedSummaryIndex(index)}
                                    >
                                        {index === 0 ? 'Final Summary' : `Part ${index}`}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right column - Summary content */}
                        <div className="pl-4 flex flex-col overflow-hidden">
                            <div className="mb-4">
                                <Button
                                    onClick={handleCopyToClipboard}
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                    Copy to Clipboard
                                </Button>
                            </div>
                            <div className="overflow-y-auto">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>
                                        {reorganizedSummaries[selectedSummaryIndex] || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
