"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation'
import { Tooltip } from 'react-tooltip';
import ShinyText from "./ShinyText/ShinyText";
import StarBorder from "./StarBorder/StarBorder";
import nIcon from "../../public/favicon.png";

type HeaderProps = {
    isLoggedIn: boolean;
    chatName: string;
    chatId: string;
};

const Header: React.FC<HeaderProps> = ({ isLoggedIn, chatName, chatId }) => {
    const router = useRouter();
    const headerRef = useRef<HTMLElement>(null);
    const chatNameInputRef = useRef<HTMLInputElement>(null);
    const [currentChatName, setCurrentChatName] = useState<string>(chatName);
    const [tooltipHint, setTooltipHint] = useState<string>("Click to edit");

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0) {
                headerRef.current?.classList.remove("notAtTheTop");
            } else {
                headerRef.current?.classList.add("notAtTheTop");
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        setCurrentChatName(chatName);
    }, [chatName]);

    const updateName = async () => {
        setTooltipHint("Click to edit");
        if (chatNameInputRef.current) {
            const newChatName: string = chatNameInputRef.current.value.trim();

            if (newChatName === chatName) {
                return; // To not bother API for nothing.
            }

            if (newChatName.length <= 0 || newChatName.length > 50) {
                return; // Too long or empty. 
            }

            await fetch("/api/proxy/chats", {
                method: "PUT",
                body: JSON.stringify({ title: newChatName, id: chatId })
            })
        }
    }

    const deleteChat = async () => {
        const deleteChatRequest = await fetch("/api/proxy/chats?id=" + chatId, {
            method: "DELETE"
        })

        if(deleteChatRequest.status === 200) {
            window.location.href = "https://nexodus.maksym.ch"
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            chatNameInputRef.current?.blur();
        }
    };

    if (!isLoggedIn) {
        return (
            <header>
                <Image src={nIcon}
                    width={50}
                    height={55}
                    draggable={false}
                    priority={true}
                    alt="Another Logo of Nexodus" />
                <div className="headerDiv">
                    <StarBorder
                        as="button"
                        className="crudButton"
                        color="#21A698"
                        speed="5s"
                        onClick={() => router.push('/signup')}
                    >
                        <ShinyText text="Sign Up" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                    <StarBorder
                        as="button"
                        className="crudButton"
                        color="#21A698"
                        speed="5s"
                        onClick={() => router.push('/login')}
                    >
                        <ShinyText text="Log In" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                </div>
            </header>
        );
    } else {
        return (
            <header ref={headerRef} className="loggedHeader">
                <div className="headerDiv leftHeaderDiv">
                    <StarBorder
                        as="button"
                        className="crudButton chats"
                        color="#21A698"
                        speed="5s"
                        onClick={() => {
                            const chatListElement = document.getElementById("chatList");
                            if (chatListElement) {
                                chatListElement.style.display = "block";
                            }
                        }}
                    >
                        <ShinyText text="Chats" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                    {chatId !== "NONE" ? <StarBorder
                        as="button"
                        className="crudButton delete"
                        color="#21A698"
                        speed="5s"
                        onClick={() => deleteChat()}
                    >
                        <ShinyText text="Delete" disabled={false} speed={5} className='buttonText' />
                    </StarBorder> : <></>}
                </div>
                {chatId !== "NONE" ? <input
                    type="text"
                    value={currentChatName}
                    ref={chatNameInputRef}
                    maxLength={50}
                    onChange={(e) => setCurrentChatName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    onBlur={() => updateName()}
                    onFocus={() => setTooltipHint("Enter to confirm")}
                    data-tooltip-id="chatTitle"
                    data-tooltip-content={tooltipHint}
                /> : <></>}
                <div className="headerDiv">
                    <StarBorder
                        as="button"
                        className="crudButton logOut"
                        color="#21A698"
                        speed="5s"
                        onClick={() => {
                            fetch("/api/proxy/logout").then((response) => {
                                if (response.status === 200) {
                                    window.location.reload();
                                }
                            });
                        }
                        }
                    >
                        <ShinyText text="Log Out" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                </div>
                <Tooltip id="chatTitle" style={{ borderRadius: 10, backgroundColor: "black" }} />
            </header>
        );
    }
};

export default Header;