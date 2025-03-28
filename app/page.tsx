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
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true);
  const [messages, setMessages] = useState<{ role: string; content: string; }[] | null>(null);
  const [messageCount, setMessageCount] = useState<Number>(0);
  const [isCurrentlyGenerating, setIsCurrentlyGenerating] = useState<boolean>(false);
  const [stopGenerate, setStopGenerate] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async () => {
      setStopGenerate(false); // Reset stopGenerate to false at the start
      setMessageCount((prev) => Number(prev) + 1); // Increment messageCount for new animations
      const prompt: string | undefined = textareaRef.current?.value.trim();
      if (prompt && !isCurrentlyGenerating) {

      if (isFirstMessage) {
        setIsFirstMessage(false);
        greetingRef.current?.remove();
        if (chatRef.current) {
          chatRef.current.style.marginBottom = "0px";
        }
      }

      if (sendButtonRef.current) {
        sendButtonRef.current.textContent = "Stop";
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
      setIsCurrentlyGenerating(true);
      callMistralAPI(prompt);
    }
  }

  const handleButton = () => {
    if (isCurrentlyGenerating) {
      setStopGenerate(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (sendButtonRef.current) {
        sendButtonRef.current.textContent = "Send";
      }
      anime.remove(".aiAnim-" + messageCount); // Reset animation for the current message
      console.log(messages);
    } else {
      sendMessage();
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {

    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const callMistralAPI = async (prompt: string): Promise<string | null> => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const API_URL = "https://api.mistral.ai/v1/chat/completions";
  
    const updatedMessages = [...(messages || []), { role: "user", content: prompt }];
    setMessages(updatedMessages);
  
    const body = JSON.stringify({
      model: "mistral-small-latest",
      stream: true,
      messages: updatedMessages,
    });
  
    const controller = new AbortController();
    abortControllerRef.current = controller;
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: body,
        signal: controller.signal
      });
  
      if (!response.ok || !response.body) {
        console.error("Erreur API:", await response.text());
        return null;
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
  
      // Création de l'élément pour afficher la réponse de l'assistant
      const aiMessageElement = document.createElement("section");
      aiMessageElement.className = "aiMessage";
      aiMessageElement.classList.add("aiAnim-" + messageCount);
      const root = ReactDOM.createRoot(aiMessageElement);
      chatRef.current?.appendChild(aiMessageElement);
      anime({
        targets: ".aiAnim-" + messageCount,
        opacity: [0, 1],
        translateY: ["-50%", "0%"],
        duration: 1000,
        easing: "easeOutExpo"
      });
  
      let assistantPlaceholderAdded = false;
  
      const updateMessage = (newText: string) => {
        aiResponse += newText;
        root.render(<AiMessageBox message={aiResponse} />);
      
        if (!assistantPlaceholderAdded) {
          updatedMessages.push({ role: "assistant", content: aiResponse });
          assistantPlaceholderAdded = true;
        } else {
          updatedMessages[updatedMessages.length - 1].content = aiResponse;
        }
      
        setMessages([...updatedMessages]); // Mise à jour du state
      };
  
      while (true) {
        const { value, done } = await reader.read();
        if (stopGenerate) {
          setStopGenerate(false);
          break;
        }
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace("data:", "").trim();
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;
  
            if (delta.content) {
              updateMessage(delta.content);
            }
          } catch (error) {
            console.warn("Erreur de parsing JSON:", error, "Chunk:", jsonStr);
          }
        }
      }
  
      setMessages([...updatedMessages]);
      setMessageCount((prev) => Number(prev) + 1);
      setIsCurrentlyGenerating(false);
      return null;
    } catch (err) {
      console.error("Request error: ", err);
      setIsCurrentlyGenerating(false);
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
          <textarea name="promptArea" id="promptArea" onKeyDown={handleKeyDown} placeholder="Type a prompt..." ref={textareaRef}></textarea>
          <button onClick={handleButton} ref={sendButtonRef}>Send</button>
        </article>
      </main>
    </>
  );
}

export default Home;