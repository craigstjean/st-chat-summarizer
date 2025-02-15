import { MessageCircle } from 'lucide-react';

export function ChatList({
    selectedCharacter,
    selectedGroup,
    characterChats,
    onChatSelect
}) {
    if (selectedCharacter) {
        return characterChats.map((chat, index) => (
            <div
                key={index}
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
                onClick={() => onChatSelect(chat)}
            >
                <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    <p className="font-medium text-gray-700 group-hover:text-gray-900">{chat}</p>
                </div>
            </div>
        ));
    }

    if (selectedGroup?.chats) {
        return selectedGroup.chats.map((chat, index) => (
            <div
                key={index}
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
                onClick={() => onChatSelect(chat)}
            >
                <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    <p className="font-medium text-gray-700 group-hover:text-gray-900">{chat}</p>
                </div>
            </div>
        ));
    }

    return null;
} 