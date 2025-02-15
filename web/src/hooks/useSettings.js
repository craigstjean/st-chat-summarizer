import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
    USERNAME: 'chat-username',
    MODEL: 'chat-selected-model',
    MAX_TOKENS: 'chat-max-tokens',
    WORD_LIMIT: 'chat-word-limit'
};

export function useSettings() {
    const [username, setUsername] = useState('default-user');
    const [selectedModel, setSelectedModel] = useState('');
    const [maxTokens, setMaxTokens] = useState(4096 - 100);
    const [wordLimit, setWordLimit] = useState(400);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
        const savedMaxTokens = localStorage.getItem(STORAGE_KEYS.MAX_TOKENS);
        const savedWordLimit = localStorage.getItem(STORAGE_KEYS.WORD_LIMIT);

        if (savedUsername) setUsername(savedUsername);
        if (savedModel) setSelectedModel(savedModel);
        if (savedMaxTokens) setMaxTokens(savedMaxTokens);
        if (savedWordLimit) setWordLimit(savedWordLimit);
    }, []);

    const handleUsernameChange = (value) => {
        setUsername(value);
        localStorage.setItem(STORAGE_KEYS.USERNAME, value);
    };

    const handleModelChange = (value) => {
        setSelectedModel(value);
        localStorage.setItem(STORAGE_KEYS.MODEL, value);
    };

    const handleMaxTokensChange = (value) => {
        setMaxTokens(value);
        localStorage.setItem(STORAGE_KEYS.MAX_TOKENS, value);
    };

    const handleWordLimitChange = (value) => {
        setWordLimit(value);
        localStorage.setItem(STORAGE_KEYS.WORD_LIMIT, value);
    };

    return {
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
    };
} 