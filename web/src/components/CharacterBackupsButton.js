"use client";

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import {toast} from "@/hooks/use-toast";

export function CharacterBackupsButton({fetchAPI, username, character}) {
    const [backups, setBackups] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [backupContent, setBackupContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const parseBackupDate = (backupName) => {
        // Extract the date-time part from chat_<name>_yyyyMMdd-HHmmss.jsonl
        const dateMatch = backupName.match(/(\d{8}-\d{6})\.jsonl$/);
        if (!dateMatch) return null;

        const datePart = dateMatch[1];
        // Parse yyyyMMdd-HHmmss format
        const year = datePart.slice(0, 4);
        const month = datePart.slice(4, 6);
        const day = datePart.slice(6, 8);
        const hour = datePart.slice(9, 11);
        const minute = datePart.slice(11, 13);
        const second = datePart.slice(13, 15);

        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    };

    const formatBackupDate = (date) => {
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const fetchBackups = async () => {
        const queryParams = new URLSearchParams({
            user: username,
        }).toString();

        try {
            const encodedCharacter = encodeURIComponent(character);
            const backups = await fetchAPI(`/characters/${encodedCharacter}/backups?${queryParams}`);

            // Sort backups by date (newest first)
            const sortedBackups = backups.sort((a, b) => {
                const dateA = parseBackupDate(a);
                const dateB = parseBackupDate(b);
                return dateB - dateA;
            });

            setBackups(sortedBackups);

            setBackups(sortedBackups);
            setIsOpen(true);
        } catch (error) {
            console.error('Error fetching backups:', error);
            throw error;
        }
    };

    const fetchBackupContent = async (backup) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                user: username,
            }).toString();

            const encodedCharacter = encodeURIComponent(character);
            const encodedBackup = encodeURIComponent(backup);
            const content = await fetchAPI(
                `/characters/${encodedCharacter}/backups/${encodedBackup}?${queryParams}`
            );
            setBackupContent(content);
            setSelectedBackup(backup);
        } catch (error) {
            console.error('Error fetching backup content:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedBackup) return;

        try {
            const queryParams = new URLSearchParams({
                user: username,
            }).toString();

            const encodedCharacter = encodeURIComponent(character);
            const encodedBackup = encodeURIComponent(selectedBackup);

            const response = await fetchAPI(`/characters/${encodedCharacter}/backups/${encodedBackup}/restore?${queryParams}`, false, 'POST');

            const {message, newFileName} = response;
            toast({title: message, description: newFileName, status: 'success'})
            setIsOpen(false);
        } catch (error) {
            console.error('Error restoring backup:', error);
            toast({title: 'Error', description: 'Failed to restore backup', status: 'error'})
        }
    };

    return (
        <>
            <Button onClick={fetchBackups} variant="secondary" size="sm">
                View Backups
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[75vw] max-h-[60vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Character Backups</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 grid grid-cols-[300px_1fr] gap-4 flex-1 min-h-0">
                        {/* Left column - Backup list */}
                        <div className="border-r pr-4 overflow-y-auto">
                            {backups.length === 0 ? (
                                <p>No backups found</p>
                            ) : (
                                <ul className="space-y-2">
                                    {backups.map((backup, index) => {
                                        const date = parseBackupDate(backup);
                                        return (
                                            <li
                                                key={index}
                                                className={`p-2 rounded-md cursor-pointer transition-colors
                                                    ${backup === selectedBackup
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary hover:bg-secondary/80'}`}
                                                onClick={() => fetchBackupContent(backup)}
                                            >
                                                {date ? formatBackupDate(date) : backup}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Right column - Markdown content */}
                        <div className="pl-4 flex flex-col min-h-0">
                            {selectedBackup && (
                                <div className="mb-4">
                                    <Button
                                        onClick={handleRestore}
                                        variant="default"
                                        size="sm"
                                    >
                                        Restore
                                    </Button>
                                </div>
                            )}
                            <div className="overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p>Loading...</p>
                                    </div>
                                ) : selectedBackup ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>
                                            {backupContent || ''}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <p>Select a backup to view its content</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
