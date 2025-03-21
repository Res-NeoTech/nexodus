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
  const [isCurrentlyGenerating, setIsCurrentlyGenerating] = useState<boolean>(false);

  const sendMessage = async () => {
    const prompt: string | undefined = textareaRef.current?.value;
    if (prompt && !isCurrentlyGenerating) {

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
      setIsCurrentlyGenerating(true);
      callMistralAPI(prompt);
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

    // On ajoute le message utilisateur à l'historique
    const updatedMessages = [...(messages || []), { role: "user", content: prompt }];
    setMessages(updatedMessages);

    const body = JSON.stringify({
      model: "mistral-small-latest",
      stream: true,
      messages: updatedMessages,
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

      const updateMessage = (newText: string, toolCalls?: any) => {
        if (toolCalls) {
          if (!assistantPlaceholderAdded) {
            updatedMessages.push({ role: "assistant", content: "" });
            assistantPlaceholderAdded = true;
          }
          root.render(<AiMessageBox message={""} />);
        } else {
          aiResponse += newText;
          root.render(<AiMessageBox message={aiResponse} />);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
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

            if (delta.tool_calls) {
              updateMessage("", delta.tool_calls);
            } else if (delta.content) {
              updateMessage(delta.content);
            }
          } catch (error) {
            console.warn("Erreur de parsing JSON:", error, "Chunk:", jsonStr);
          }
        }
      }

      if (!assistantPlaceholderAdded) {
        updatedMessages.push({ role: "assistant", content: aiResponse });
      }
      setMessages([...updatedMessages]);
      setMessageCount(Number(messageCount) + 1);
      setIsCurrentlyGenerating(false);
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
          <textarea name="promptArea" id="promptArea" onKeyDown={handleKeyDown} placeholder="Type a prompt..." ref={textareaRef}></textarea>
          <button onClick={sendMessage}>Send</button>
        </article>
      </main>
    </>
  );
}

export default Home;