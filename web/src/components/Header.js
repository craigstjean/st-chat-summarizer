"use client";

import { MessageSquare, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({
    selectedCharacter,
    selectedGroup,
    selectedChat,
    setSettingsOpen
}) {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <MessageSquare className="h-8 w-8 text-blue-500" />
                        <h1 className="ml-3 text-xl font-semibold text-gray-900">SillyTavern Chat Summarizer</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => setSettingsOpen(true)}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {(selectedCharacter || selectedGroup) && (
                    <div className="py-2 flex items-center text-sm text-gray-500">
                        <span className="px-2">
                            {selectedCharacter ? 'Character' : 'Group'} → {selectedCharacter || selectedGroup?.name}
                            {selectedChat && ` → ${selectedChat}`}
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
} 