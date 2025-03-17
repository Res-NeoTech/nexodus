"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import ReactDOM from "react-dom/client";

import UserMessageBox from "./components/userMessage";

import "./styles/chat.scss";
import nexodusImage from "../public/nexodus.png";

function Home() {
  const chatRef = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true);

  const sendMessage = async () => {
    const prompt: string | undefined = textareaRef.current?.value;
    if (prompt) {

      if (isFirstMessage) {
        setIsFirstMessage(false);
        greetingRef.current?.remove();
      }

      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      const userMessageElement = document.createElement('section');
      userMessageElement.className = 'userMessage';
      const root = ReactDOM.createRoot(userMessageElement);
      root.render(<UserMessageBox message={prompt} />);
      chatRef.current?.appendChild(userMessageElement);
      callMistralAPI(prompt);
    }
  }

  const callMistralAPI = async (prompt: string): Promise<string | null> => {
    const API_KEY: string = "KEY HERE";
    const API_URL: string = "https://api.mistral.ai/v1/chat/completions";

    const body = JSON.stringify({
      model: "mistral-small-latest",
      stream: false,
      messages: [{ role: "user", content: prompt }]
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
      const userMessageElement = document.createElement('section');
      userMessageElement.className = 'userMessage';
      const root = ReactDOM.createRoot(userMessageElement);
      root.render(<UserMessageBox message={data.choices[0].message.content} />);
      chatRef.current?.appendChild(userMessageElement);
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