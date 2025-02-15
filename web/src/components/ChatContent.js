import { UserCircle, Users, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { CharacterBackupsButton } from './CharacterBackupsButton';
import { ChatList } from './ChatList';

export function ChatContent({
    selectedChat,
    chatContent,
    selectedCharacter,
    selectedGroup,
    characters,
    groupChats,
    characterChats,
    onBack,
    onSummarize,
    onCharacterSelect,
    onGroupSelect,
    onChatSelect,
    username,
    fetchAPI
}) {
    if (selectedChat && chatContent) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button onClick={onBack} variant="outline" size="sm" className="hover:border-blue-200">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={onSummarize}
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
                        >
                            Summarize Chat
                        </Button>
                        <CharacterBackupsButton
                            fetchAPI={fetchAPI}
                            username={username}
                            character={selectedCharacter}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 pb-4 border-b">
                        Chat Content
                    </h2>
                    <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                            <ReactMarkdown>{chatContent || ''}</ReactMarkdown>
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
                    <Button onClick={onBack} variant="outline" size="sm" className="hover:border-blue-200">
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
                    <ChatList
                        selectedCharacter={selectedCharacter}
                        selectedGroup={selectedGroup}
                        characterChats={characterChats}
                        onChatSelect={onChatSelect}
                    />
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
                            onClick={() => onCharacterSelect(character)}
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
                            onClick={() => onGroupSelect(chat)}
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
} 