"use client";
import AnimatedList from './AnimatedList/AnimatedList';
import { useEffect, useState } from 'react';

const getAllChats = async () => {
    const getAllChatsRequest = await fetch("/api/proxy/chats/list", {
        method: "GET"
    });

    if (getAllChatsRequest.status === 200) {
        const data = await getAllChatsRequest.json();
        return data.result;
    }

    return [];
}

function ChatList() {
    const [apiItems, setApiItems] = useState<{ title: string; id: string }[]>([]);

    useEffect(() => {
        const fetchChats = async () => {
            const chats = await getAllChats();
            chats.unshift({ title: "Start a new chat", id: "NEW" });
            setApiItems(chats);
        };
        fetchChats();
    }, []);

    const itemNames = apiItems.map((item) => item.title);

    return (
        <section
            id='chatList'
            hidden={true}
            onClick={() => {
                const chatListElement = document.getElementById("chatList");
                if (chatListElement) {
                    chatListElement.hidden = true;
                }
            }}
        >
            <h1>Select Chat</h1>
            <AnimatedList
                items={itemNames}
                onItemSelect={(_, index) => {
                    if (!document.getElementById("chatList")?.hidden) {
                        const selectedItem = apiItems[index];
                        if(selectedItem.id === "NEW") {
                            window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}`;
                        } else {
                            window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}?chatId=${selectedItem.id}`;
                        }
                    }
                }}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={true}
            />
        </section>
    );
}

export default ChatList;