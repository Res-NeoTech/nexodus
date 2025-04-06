"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import ReactDOM from "react-dom/client";
import anime from "animejs";

import UserMessageBox from "./components/userMessage";
import AiMessageBox from "./components/aiMessage";

import "./styles/chat.scss";
import nexodusImage from "../public/nexodus.png";
import CheckboxSearch from "./components/chkSearch";

function Home() {
  const chatRef = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true);
  const [messages, setMessages] = useState<{ role: string; content: string; }[] | null>(null);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isCurrentlyGenerating, setIsCurrentlyGenerating] = useState<boolean>(false);
  const [stopGenerate, setStopGenerate] = useState<boolean>(false);
  const [preferBottom, setPreferBottom] = useState<boolean>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const preferBottomRef = useRef(preferBottom);
  const [isOnlineSearch, setIsOnlineSearch] = useState(false);


  // useEffect here to check if user prefer to be scrolled automatically while AI generates a response.
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100);

      if (preferBottomRef.current !== isAtBottom) {
        preferBottomRef.current = isAtBottom;
        setPreferBottom(isAtBottom);
        //console.log("Updated preferBottom:", isAtBottom);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    preferBottomRef.current = preferBottom;
  }, [preferBottom]);

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

  /**
   * Calls a Mistral API with a user-entered prompt and renders the response. Also calls BraveSearchAPI if user wishes to run web search.
   * @param prompt Prompt entered by user.
   * @author NeoTech, FauZaPespi
   * @returns a promise, this returned promise is nowhere used.
   */
  const callMistralAPI = async (prompt: string): Promise<string | null> => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const API_URL = "https://api.mistral.ai/v1/chat/completions";

    if (!API_KEY) {
      console.error("API Key is missing");
      return null;
    }

    setIsCurrentlyGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let systemMessage = "";
      if (isOnlineSearch) {
        // Step 1: Retrieve Google Search Results
        const googleResults = await fetch(`/api/search-brave?q=${encodeURIComponent(prompt)}`, {
          signal: abortController.signal, // Attach the AbortController signal
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
          })
          .catch((err) => {
            if (abortController.signal.aborted) {
              return null;
            }
            console.error("Error during Brave search:", err);
            return null;
          });
  
        if (stopGenerate || !googleResults) {
          setIsCurrentlyGenerating(false);
          return null;
        }
  
        const resultsArray = Array.isArray(googleResults?.results) ? googleResults.results : [];
  
        // Step 3: Extract meaningful snippets from search results
        const googleSummary = resultsArray
          .slice(0, 3)
          .map((result: { title: string; description: string }) => `- ${result.title}: ${result.description}`)
          .join("\n") || "No relevant information found.";
  
        // Step 4: Construct the system message with Google results
        systemMessage = `Based on recent search results, here is relevant information:\n\n${googleSummary}\n\nNow answer the user's question accurately, and take conscious about the previous message.`;
        console.log("Google Search Results:", resultsArray);
      }
      
      if (stopGenerate) {
        setIsCurrentlyGenerating(false);
        return null;
      }
      // Step 4: Prepare messages for Mistral AI
      const updatedMessages = [
        ...(messages || []),
        ...(isOnlineSearch ? [{ role: "user", content: systemMessage }] : []),
        { role: "user", content: prompt }
      ];

      setMessages(updatedMessages);

      // Step 5: Call Mistral AI API
      const body = JSON.stringify({
        model: "mistral-small-latest",
        stream: true,
        messages: updatedMessages,
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

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
        console.error("API Error:", await response.text());
        return null;
      }

      // Step 6: Process Streaming Response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

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
        if (!stopGenerate) {
          aiResponse += newText;
          root.render(<AiMessageBox message={aiResponse} />);

          if (!assistantPlaceholderAdded) {
            updatedMessages.push({ role: "assistant", content: aiResponse });
            assistantPlaceholderAdded = true;
          } else {
            updatedMessages[updatedMessages.length - 1].content = aiResponse;
          }

          setMessages([...updatedMessages]); // Update state
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (stopGenerate) {
          setStopGenerate(false);
          break;
        }
        if (preferBottomRef.current) {
          window.scrollTo(0, document.documentElement.scrollHeight);
        }
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.trim() === "[DONE]") {
            // Ignore and break when reaching the end of stream
            break;
          }
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
            console.warn("JSON Parse Error:", error, "Chunk:", jsonStr);
          }
        }
      }

      setMessages([...updatedMessages]);
      setMessageCount((prev) => Number(prev) + 1);
      setIsCurrentlyGenerating(false);
      if (sendButtonRef.current) {
        sendButtonRef.current.textContent = "Send";
      }
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
          <CheckboxSearch checked={isOnlineSearch} setChecked={setIsOnlineSearch} />
          <textarea name="promptArea" id="promptArea" onKeyDown={handleKeyDown} placeholder="Type a prompt..." ref={textareaRef}></textarea>
          <button onClick={handleButton} ref={sendButtonRef}>Send</button>
        </article>
      </main>
    </>
  );
}

export default Home;
