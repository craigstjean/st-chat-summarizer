"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Users, MessageCircle, UserCircle, MessageSquare, Menu, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SettingsDialog = ({
  open,
  onOpenChange,
  username,
  onUsernameChange,
  selectedModel,
  onModelChange,
  models
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-500" />
          Settings
        </DialogTitle>
      </DialogHeader>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <Input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Enter username"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Summarizer Model</label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model, index) => (
                <SelectItem key={index} value={model.model}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const ChatApp = ({ apiBaseUrl }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current route
  const pathParts = pathname.split('/').filter(Boolean);
  const initialView = pathParts[0] || 'characters';
  const initialCharacter = pathParts[1] ? decodeURIComponent(pathParts[1]) : null;
  const initialChat = pathParts[2] ? decodeURIComponent(pathParts[2]) : null;
  const initialGroup = searchParams.get('group');

  // Character and Group states
  const [characters, setCharacters] = useState([]);
  const [groupChats, setGroupChats] = useState([]);

  // Character states
  const [selectedCharacter, setSelectedCharacter] = useState(initialCharacter);
  const [characterChats, setCharacterChats] = useState([]);

  // Group states
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);

  // Common states
  const [selectedChat, setSelectedChat] = useState(initialChat);
  const [chatContent, setChatContent] = useState(null);
  const [currentView, setCurrentView] = useState(initialView);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [username, setUsername] = useState('default-user');

  const fetchAPI = async (endpoint, isText = false) => {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return isText ? await response.text() : await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  };

  // Update URL based on navigation
  const updateRoute = (view, character = null, chat = null, group = null) => {
    let newPath = '/';
    const params = new URLSearchParams();

    if (view === 'characters' && character) {
      newPath += `characters/${character}`;
      if (chat) newPath += `/${chat}`;
    } else if (view === 'groupChats' && group) {
      newPath += 'groupChats';
      params.set('group', group.name);
      if (chat) params.set('chat', chat);
    } else if (view === 'characters' || view === 'groupChats') {
      newPath += view;
    }

    const queryString = params.toString();
    router.push(queryString ? `${newPath}?${queryString}` : newPath, { scroll: false });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [charactersData, groupChatsData, modelsData] = await Promise.all([
          fetchAPI('/characters'),
          fetchAPI('/groupChats'),
          fetchAPI('/models'),
        ]);

        setCharacters(charactersData);
        setGroupChats(groupChatsData);
        setModels(modelsData);

        // Set selected model to the default one, or fall back to first model
        const defaultModel = modelsData.find(model => model.default)?.model;
        setSelectedModel(defaultModel || (modelsData.length > 0 ? modelsData[0].model : ''));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (loading || !characters.length || !groupChats.length) return; // Wait for initial data

    const loadInitialState = async () => {
      try {
        const currentPathParts = pathname.split('/').filter(Boolean);
        const currentView = currentPathParts[0] || 'characters';
        const currentCharacter = currentPathParts[1] ? decodeURIComponent(currentPathParts[1]) : null;
        const currentChat = currentPathParts[2] ? decodeURIComponent(currentPathParts[2]) : null;
        const currentGroup = searchParams.get('group');

        setSelectedCharacter(currentCharacter);
        setSelectedGroup(currentGroup);
        setSelectedChat(currentChat);
        setCurrentView(currentView);

        const queryParams = new URLSearchParams({
          user: username,
        }).toString();

        let encodedCharacter = encodeURIComponent(currentCharacter);
        let encodedChat = encodeURIComponent(currentChat);

        if (currentCharacter && characters.includes(currentCharacter)) {
          const chats = await fetchAPI(`/chats/${encodedCharacter}?${queryParams}`);
          setCharacterChats(chats);
          setSelectedCharacter(currentCharacter);
          setCurrentView('characters');

          if (currentChat) {
            const content = await fetchAPI(`/chats/${encodedCharacter}/${encodedChat}?${queryParams}`);
            setChatContent(content);
            setSelectedChat(currentChat);
          }
        } else if (currentGroup) {
          const group = groupChats.find(g => g.name === currentGroup);
          if (group) {
            setSelectedGroup(group);
            setCurrentView('groupChats');
            const chatParam = searchParams.get('chat');
            const encodedChatParam = encodeURIComponent(searchParams.get('chat'));
            if (chatParam) {
              const content = await fetchAPI(`/groupChats/${encodedChatParam}?${queryParams}`);
              setChatContent(content);
              setSelectedChat(chatParam);
            }
          }
        } else {
          // Only reset view for root paths
          setCurrentView(currentView);
        }
      } catch (err) {
        console.error('Error loading initial state:', err);
      }
    };

    loadInitialState();
  }, [characters.length, groupChats.length, pathname, searchParams.get('group'), searchParams.get('chat')]); // Only run when initial data is loaded

  const handleCharacterSelect = async (character) => {
    try {
      setLoading(true);
      setSelectedCharacter(character);
      setSelectedGroup(null);
      setSelectedChat(null);
      setChatContent(null);

      const queryParams = new URLSearchParams({
        user: username,
      }).toString();

      let encodedCharacter = encodeURIComponent(character);
      const chats = await fetchAPI(`/chats/${encodedCharacter}?${queryParams}`);
      setCharacterChats(chats);

      updateRoute('characters', character);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedCharacter(null);
    setSelectedChat(null);
    setChatContent(null);

    updateRoute('groupChats', null, null, group);
  };

  const handleChatSelect = async (chat) => {
    try {
      setLoading(true);
      setSelectedChat(chat);

      const queryParams = new URLSearchParams({
        user: username,
      }).toString();

      let encodedCharacter = encodeURIComponent(selectedCharacter);
      let encodedChat = encodeURIComponent(chat);

      let content;
      if (selectedCharacter) {
        content = await fetchAPI(`/chats/${encodedCharacter}/${encodedChat}?${queryParams}`);
        updateRoute('characters', selectedCharacter, chat);
      } else if (selectedGroup) {
        content = await fetchAPI(`/groupChats/${encodedChat}?${queryParams}`);
        updateRoute('groupChats', null, chat, selectedGroup);
      }
      setChatContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        model: selectedModel
      }).toString();

      let summaryText;
      let encodedCharacter = encodeURIComponent(selectedCharacter);
      let encodedChat = encodeURIComponent(selectedChat);
      if (selectedCharacter) {
        summaryText = await fetchAPI(
          `/chats/${encodedCharacter}/${encodedChat}/summary?${queryParams}`,
          true
        );
      } else if (selectedGroup) {
        summaryText = await fetchAPI(
          `/groupChats/${encodedChat}/summary?${queryParams}`,
          true
        );
      }
      setSummary(summaryText);
      setSummaryOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  const renderChatList = () => {
    if (selectedCharacter) {
      return characterChats.map((chat, index) => (
        <div
          key={index}
          className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
          onClick={() => handleChatSelect(chat)}
        >
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            <p className="font-medium text-gray-700 group-hover:text-gray-900">{chat}</p>
          </div>
        </div>
      ));
    }

    if (selectedGroup) {
      if (!selectedGroup.chats) return null;
      return selectedGroup.chats.map((chat, index) => (
        <div
          key={index}
          className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
          onClick={() => handleChatSelect(chat)}
        >
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            <p className="font-medium text-gray-700 group-hover:text-gray-900">{chat}</p>
          </div>
        </div>
      ));
    }
  };

  const renderContent = () => {
    if (selectedChat && chatContent) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={handleBack} variant="outline" size="sm" className="hover:border-blue-200">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSummarize}
                variant="outline"
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
              >
                Summarize Chat
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800 pb-4 border-b">
              Chat Content
            </h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                <ReactMarkdown>{chatContent}</ReactMarkdown>
              </pre>
            </div>
          </div>
        </div>
      );
    }

    if (selectedCharacter || selectedGroup) {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBack} variant="outline" size="sm" className="hover:border-blue-200">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedCharacter ? (
                <div className="flex items-center">
                  <UserCircle className="w-6 h-6 mr-2 text-blue-500" />
                  Chats with {selectedCharacter}
                </div>
              ) : (
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-500" />
                  {selectedGroup.name} Discussions
                </div>
              )}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {renderChatList()}
          </div>
        </div>
      );
    }

    return (
      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger
            value="characters"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <UserCircle className="w-5 h-5 mr-2" />
            Characters
          </TabsTrigger>
          <TabsTrigger
            value="groupChats"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <Users className="w-5 h-5 mr-2" />
            Group Chats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
                onClick={() => handleCharacterSelect(character)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                    <UserCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-gray-900">{character}</p>
                    <p className="text-sm text-gray-500">View chats</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groupChats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupChats.map((chat, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
                onClick={() => handleGroupSelect(chat)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">{chat.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {chat.members.length} members · {chat.chats.length} chats
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const Header = () => (
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        username={username}
        onUsernameChange={setUsername}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        models={models}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Content Area */}
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              {renderContent()}
            </CardContent>
          </Card>
        </div>

        {/* Summary Dialog */}
        <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                Chat Summary
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 flex-1 overflow-y-auto">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                <div className="prose prose-blue max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
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
