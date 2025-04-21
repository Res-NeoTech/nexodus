"use client";
import AnimatedList from './AnimatedList/AnimatedList';
import { useEffect, useState } from 'react';

const getAllChats = async () => {
    const getAllChatsRequest = await fetch("/api/proxy/chats/list", {
        method: "GET"
    });

    if(getAllChatsRequest.status === 200) {
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
            setApiItems(chats);
        };
        fetchChats();
    }, []);

    const itemNames = apiItems.map((item) => item.title);
    return (
        <section id='chatList' onClick={() => {
            const chatListElement = document.getElementById("chatList");
            if (chatListElement) {
                chatListElement.style.display = "none";
            }
        }}>
            <h1>Select Chat</h1>
            <AnimatedList
                items={itemNames}
                onItemSelect={(_, index) => {
                    const selectedItem = apiItems[index];
                    window.location.href = "http://localhost:3000?chatId=" + selectedItem.id;
                }}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={true}
            />
        </section>
    );
}

export default ChatList;