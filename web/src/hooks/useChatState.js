import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouteManagement } from './useRouteManagement';

export function useChatState(initialState, fetchAPI, { setLoading, setError, username, selectedModel, maxTokens, wordLimit }) {
    const { updateRoute } = useRouteManagement();
    const initialLoadDone = useRef(false);
    const stableInitialState = useRef(initialState);
    const [characters, setCharacters] = useState([]);
    const [groupChats, setGroupChats] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(initialState.initialCharacter);
    const [characterChats, setCharacterChats] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(initialState.initialGroup);
    const [selectedChat, setSelectedChat] = useState(initialState.initialChat);
    const [chatContent, setChatContent] = useState(null);
    const [currentView, setCurrentView] = useState(initialState.initialView);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summaryArray, setSummaryArray] = useState([]);
    const [models, setModels] = useState([]);
    const [users, setUsers] = useState([]);

    // Wrap handlers in useCallback with proper dependencies
    const handleCharacterSelect = useCallback(async (character) => {
        try {
            setLoading(true);
            setSelectedCharacter(character);
            setSelectedGroup(null);
            setSelectedChat(null);
            setChatContent(null);

            const chats = await fetchAPI(`/chats/${encodeURIComponent(character)}`);
            setCharacterChats(chats);

            updateRoute('characters', character);
        } catch (err) {
            console.error('Error selecting character:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchAPI, updateRoute, setLoading, setError]);

    const handleGroupSelect = useCallback((group) => {
        setSelectedGroup(group);
        setSelectedCharacter(null);
        setSelectedChat(null);
        setChatContent(null);

        updateRoute('groupChats', null, null, group);
    }, [updateRoute]);

    const handleChatSelect = useCallback(async (chat) => {
        try {
            setSelectedChat(chat);

            let content;
            if (selectedCharacter) {
                content = await fetchAPI(`/chats/${encodeURIComponent(selectedCharacter)}/${encodeURIComponent(chat)}`);
                updateRoute('characters', selectedCharacter, chat);
            } else if (selectedGroup) {
                content = await fetchAPI(`/groupChats/${encodeURIComponent(chat)}`);
                updateRoute('groupChats', null, chat, selectedGroup);
            }
            setChatContent(content);
        } catch (err) {
            console.error('Error selecting chat:', err);
        }
    }, [fetchAPI, selectedCharacter, selectedGroup, updateRoute]);

    useEffect(() => {
        if (initialLoadDone.current) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [charactersData, groupChatsData, modelsData, usersData] = await Promise.all([
                    fetchAPI('/characters'),
                    fetchAPI('/groupChats'),
                    fetchAPI('/models'),
                    fetchAPI('/users'),
                ]);

                setCharacters(charactersData);
                setGroupChats(groupChatsData);
                setModels(modelsData);
                setUsers(usersData);

                // Handle initial character route
                if (stableInitialState.current.initialCharacter && charactersData.includes(stableInitialState.current.initialCharacter)) {
                    const chats = await fetchAPI(`/chats/${encodeURIComponent(stableInitialState.current.initialCharacter)}`);
                    setCharacterChats(chats);

                    if (stableInitialState.current.initialChat) {
                        const content = await fetchAPI(
                            `/chats/${encodeURIComponent(stableInitialState.current.initialCharacter)}/${encodeURIComponent(stableInitialState.current.initialChat)}`
                        );
                        setChatContent(content);
                    }
                }
                // Handle initial group route
                else if (stableInitialState.current.initialGroup) {
                    const group = groupChatsData.find(g => g.name === stableInitialState.current.initialGroup);
                    if (group) {
                        setSelectedGroup(group);
                        if (stableInitialState.current.initialChat) {
                            const content = await fetchAPI(`/groupChats/${encodeURIComponent(stableInitialState.current.initialChat)}`);
                            setChatContent(content);
                        }
                    }
                }

                initialLoadDone.current = true;
            } catch (error) {
                console.error('Error loading data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchAPI, setLoading, setError]);

    const handleBack = () => {
        if (selectedChat) {
            setSelectedChat(null);
            setChatContent(null);
            updateRoute(currentView, selectedCharacter, null, selectedGroup);
        } else if (selectedCharacter) {
            setSelectedCharacter(null);
            setCharacterChats([]);
            updateRoute('characters');
        } else if (selectedGroup) {
            setSelectedGroup(null);
            updateRoute('groupChats');
        }
    };

    const handleSummarize = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams({
                user: username,
                model: selectedModel,
                max_tokens: maxTokens,
                summary_words: wordLimit,
            }).toString();

            let summaries = [];
            let encodedCharacter = encodeURIComponent(selectedCharacter);
            let encodedChat = encodeURIComponent(selectedChat);
            if (selectedCharacter) {
                summaries = await fetchAPI(`/chats/${encodedCharacter}/${encodedChat}/summary?${queryParams}`);
            } else if (selectedGroup) {
                summaries = await fetchAPI(`/groupChats/${encodedChat}/summary?${queryParams}`);
            }
            setSummaryArray(summaries);
            setSummaryOpen(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        characters,
        groupChats,
        selectedCharacter,
        characterChats,
        selectedGroup,
        selectedChat,
        chatContent,
        currentView,
        summaryOpen,
        summaryArray,
        models,
        users,
        setCharacters,
        setGroupChats,
        setModels,
        setUsers,
        handleCharacterSelect,
        handleGroupSelect,
        handleChatSelect,
        handleBack,
        handleSummarize,
        setSummaryOpen
    };
} 