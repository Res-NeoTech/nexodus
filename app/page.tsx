"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import ReactDOM from "react-dom/client";
import anime from "animejs";

import UserMessageBox from "./components/userMessage";
import AiMessageBox from "./components/aiMessage";

import "./styles/chat.scss";
import nexodusImage from "../public/nexodus.png";

function Home() {
  const chatRef = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true);
  const [messages, setMessages] = useState<{ role: string; content: string; }[] | null>(null);
  const [messageCount, setMessageCount] = useState<Number>(0);

  const sendMessage = async () => {
    const prompt: string | undefined = textareaRef.current?.value;
    if (prompt) {

      if (isFirstMessage) {
        setIsFirstMessage(false);
        greetingRef.current?.remove();
        if (chatRef.current) {
          chatRef.current.style.marginBottom = "0px";
        }
      }

      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      const userMessageElement = document.createElement('section');
      userMessageElement.className = 'userMessage';
      userMessageElement.classList.add("userAnim-" + messageCount);
      const root = ReactDOM.createRoot(userMessageElement);
      root.render(<UserMessageBox message={prompt} />);
      chatRef.current?.appendChild(userMessageElement);
      anime({
        targets: ".userAnim-" + messageCount,
        opacity: [0, 1],
        translateY: ["-50%", "0%"],
        duration: 1000,
        easing: "easeOutExpo"
      });
      callMistralAPI(prompt);
    }
  }

  const callMistralAPI = async (prompt: string): Promise<string | null> => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const API_URL = "https://api.mistral.ai/v1/chat/completions";

    // Добавляем новое сообщение пользователя
    const updatedMessages = [...(messages || []), { role: "user", content: prompt }];
    setMessages(updatedMessages);

    const body = JSON.stringify({
      model: "mistral-small-latest",
      stream: false,
      messages: updatedMessages
    });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: body
      });

      if (!response.ok) {
        console.error("Erreur API:", await response.text());
        return null;
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Добавляем ответ ИИ в историю
      const newHistory = [...updatedMessages, { role: "assistant", content: aiResponse }];
      setMessages(newHistory);

      // Отображаем ответ
      const aiMessageElement = document.createElement('section');
      aiMessageElement.className = 'aiMessage';
      aiMessageElement.classList.add("aiAnim-" + messageCount);
      const root = ReactDOM.createRoot(aiMessageElement);
      root.render(<AiMessageBox message={aiResponse} />);
      chatRef.current?.appendChild(aiMessageElement);
      anime({
        targets: ".aiAnim-" + messageCount,
        opacity: [0, 1],
        translateY: ["-50%", "0%"],
        duration: 1000,
        easing: "easeOutExpo"
      });
      setMessageCount(Number(messageCount) + 1);

      return null;
    } catch (err) {
      console.error("Erreur de requête:", err);
      return null;
    }
  };

  return (
    <>
      <main>
        <article id="chat" ref={chatRef}>
          <div className="greeting" id="greeting" ref={greetingRef} >
            <Image src={nexodusImage}
              width={400}
              height={400}
              draggable={false}
              alt="Logo of Nexodus" />
            <h5>Type a prompt below to start chatting.</h5>
          </div>
        </article>
        <article className="messageBox">
          <textarea name="promptArea" id="promptArea" placeholder="Type a prompt..." ref={textareaRef}></textarea>
          <button onClick={sendMessage}>Send</button>
        </article>
      </main>
    </>
  );
}

export default Home;