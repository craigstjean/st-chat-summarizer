import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useRouteManagement() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateRoute = (view, character = null, chat = null, group = null) => {
        let newPath = '/';
        const params = new URLSearchParams();

        if (view === 'characters' && character) {
            let encodedCharacter = encodeURIComponent(character);
            newPath += `characters/${encodedCharacter}`;
            if (chat) {
                let encodedChat = encodeURIComponent(chat);
                newPath += `/${encodedChat}`;
            }
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

    const getInitialRouteState = () => {
        const pathParts = pathname.split('/').filter(Boolean);
        const groupName = searchParams.get('group');
        const groupChat = searchParams.get('chat');

        return {
            initialView: pathParts[0] || 'characters',
            initialCharacter: pathParts[1] ? decodeURIComponent(pathParts[1]) : null,
            initialChat: pathParts[2] ? decodeURIComponent(pathParts[2]) : groupChat,
            initialGroup: groupName
        };
    };

    return {
        updateRoute,
        getInitialRouteState,
        pathname,
        searchParams
    };
} 