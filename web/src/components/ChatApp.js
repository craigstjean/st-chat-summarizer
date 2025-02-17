"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ChatContent } from '@/components/ChatContent';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { SettingsDialog } from '@/components/SettingsDialog';
import { CharacterSummaryDialog } from "@/components/CharacterSummaryDialog";
import { useRouteManagement } from '@/hooks/useRouteManagement';
import { useAPI } from '@/hooks/useAPI';
import { useSettings } from '@/hooks/useSettings';
import { useChatState } from '@/hooks/useChatState';

const ChatApp = ({ apiBaseUrl }) => {
    const { getInitialRouteState } = useRouteManagement();
    const { fetchAPI, loading, setLoading, error, setError } = useAPI(apiBaseUrl);
    const {
        username,
        selectedModel,
        maxTokens,
        wordLimit,
        settingsOpen,
        setSettingsOpen,
        handleUsernameChange,
        handleModelChange,
        handleMaxTokensChange,
        handleWordLimitChange
    } = useSettings();

    const initialState = getInitialRouteState();
    const chatState = useChatState(initialState, fetchAPI, { setLoading, setError, username, selectedModel, maxTokens, wordLimit });

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
            {loading && <LoadingOverlay />}

            <Header
                selectedCharacter={chatState.selectedCharacter}
                selectedGroup={chatState.selectedGroup}
                selectedChat={chatState.selectedChat}
                setSettingsOpen={setSettingsOpen}
            />

            <SettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                username={username}
                onUsernameChange={handleUsernameChange}
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                maxTokens={maxTokens}
                onMaxTokensChange={handleMaxTokensChange}
                wordLimit={wordLimit}
                onWordLimitChange={handleWordLimitChange}
                models={chatState.models}
                users={chatState.users}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-8">
                    <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-6 sm:p-8">
                            <ChatContent
                                {...chatState}
                                username={username}
                                fetchAPI={fetchAPI}
                                selectedChat={chatState.selectedChat}
                                chatContent={chatState.chatContent}
                                selectedCharacter={chatState.selectedCharacter}
                                selectedGroup={chatState.selectedGroup}
                                characters={chatState.characters}
                                groupChats={chatState.groupChats}
                                characterChats={chatState.characterChats}
                                onCharacterSelect={chatState.handleCharacterSelect}
                                onGroupSelect={chatState.handleGroupSelect}
                                onChatSelect={chatState.handleChatSelect}
                                onBack={chatState.handleBack}
                                onSummarize={chatState.handleSummarize}
                            />
                        </CardContent>
                    </Card>
                </div>

                <CharacterSummaryDialog
                    summaryArray={chatState.summaryArray}
                    isOpen={chatState.summaryOpen}
                    setIsOpen={chatState.setSummaryOpen}
                />
            </main>

            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 text-center text-sm text-gray-500">
                        SillyTavern Chat Summarizer · {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ChatApp;
