"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import ReactDOM from "react-dom/client";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import anime from "animejs";

import UserMessageBox from "./components/UserMessage";
import AiMessageBox from "./components/AiMessage";
import Header from "./components/Header";
import ChatList from "./components/ChatList";

import "./styles/chat.scss";
import nexodusImage from "../public/nexodus.png";
import sendIcon from "../public/send.png";
import stopIcon from "../public/stop.png";
import CheckboxSearch from "./components/CheckSearch";
import Squares from './components/Squares/Squares';

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
  const [isOnlineSearch, setIsOnlineSearch] = useState<boolean>(false);
  const [messageIcon, setMessageIcon] = useState<typeof sendIcon>(sendIcon);
  const [messageState, setMessageState] = useState<string>("Send");
  const [username, setUsername] = useState<string>("You");
  const [currentChatId, setCurrentChatId] = useState<string>("NONE");
  const [currentChatName, setCurrentChatName] = useState<string>("New Chat");

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const [hasRenderedInitialMessages, setHasRenderedInitialMessages] = useState(false);
  const [isHistoryFetched, setIsHistoryFetched] = useState<boolean>(false);

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
    const getUser = async () => {
      const request = await fetch("/api/proxy/crud");
      const data = await request.json();

      if (request.status === 200) {
        setUsername(data.result.name);
      }
    };

    const getChat = async () => {
      if (chatId) {
        const getChatRequest = await fetch("/api/proxy/chats?id=" + chatId);

        if (getChatRequest.status === 200) {
          setCurrentChatId(chatId);
          const data = await getChatRequest.json();

          if (Array.isArray(data.result.messages)) {
            setMessages(data.result.messages);
            setCurrentChatName(data.result.title);
            setIsHistoryFetched(true);
          }
        }
      }
    }

    getUser();
    getChat();
  }, []);

  useEffect(() => {
    if (messages && isHistoryFetched && !hasRenderedInitialMessages) {
      renderHistoryMessages(messages);
      setHasRenderedInitialMessages(true);
      setIsFirstMessage(false);
      greetingRef.current?.remove();
      if (chatRef.current) {
        chatRef.current.style.marginBottom = "0px";
      }
    }
  }, [isHistoryFetched, hasRenderedInitialMessages]);

  useEffect(() => {
    if (currentChatId !== "NONE") {
      setChatIdParam(currentChatId)
    }
  }, [currentChatId])

  useEffect(() => {
    preferBottomRef.current = preferBottom;
  }, [preferBottom]);

  const setChatIdParam = (chatId: string) => {
    router.push(`/?chatId=${chatId}`); //pushing chatId to url
  };

  const renderHistoryMessages = (historyMessages: { role: string; content: string; }[]) => {
    historyMessages.forEach((message, index) => {
      if (message.role === "user" && message.content.startsWith("!!SEARCH!!")) { // Do not render this message because this user prompt is techical for search function.
        return;
      }
      const messageElement = document.createElement('section');
      messageElement.className = message.role === 'user' ? 'userMessage' : 'aiMessage';

      const animationClass = `${message.role}Anim-${index}`;
      messageElement.classList.add(animationClass);

      const root = ReactDOM.createRoot(messageElement);

      if (message.role === 'user') {
        root.render(<UserMessageBox message={message.content} username={username} />);
      } else {
        root.render(<AiMessageBox message={message.content} />);
      }

      chatRef.current?.appendChild(messageElement);

      anime({
        targets: `.${animationClass}`,
        opacity: [0, 1],
        translateY: ["-50%", "0%"],
        duration: 1000,
        easing: "easeOutExpo",
        complete: () => {
          messageElement.classList.remove(animationClass);
        }
      });
    });
  };

  const sendMessage = async () => {
    setStopGenerate(false); // Reset stopGenerate to false at the start
    setMessageCount((prev) => Number(prev) + 1); // Increment messageCount for new animations
    let prompt: string | undefined = textareaRef.current?.value.trim();
    if (prompt && !isCurrentlyGenerating) {
      if (prompt.startsWith("!!SEARCH!!")) {
        prompt = prompt.substring("!!SEARCH!!".length).trim()
      }

      if (isFirstMessage) {
        setIsFirstMessage(false);
        greetingRef.current?.remove();
        if (chatRef.current) {
          chatRef.current.style.marginBottom = "0px";
        }
      }

      if (sendButtonRef.current) {
        setMessageIcon(stopIcon);
        setMessageState("Stop");
      }

      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      const userMessageElement = document.createElement('section');
      userMessageElement.className = 'userMessage';
      userMessageElement.classList.add("userAnim-" + messageCount);
      const root = ReactDOM.createRoot(userMessageElement);
      root.render(<UserMessageBox message={prompt} username={username} />);
      chatRef.current?.appendChild(userMessageElement);
      anime({
        targets: ".userAnim-" + messageCount,
        opacity: [0, 1],
        translateY: ["-50%", "0%"],
        duration: 1000,
        easing: "easeOutExpo"
      });
      setIsCurrentlyGenerating(true);
      callMistralAPI(prompt)
    }
  }

  const handleButton = () => {
    if (isCurrentlyGenerating) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (sendButtonRef.current) {
        setMessageIcon(sendIcon);
        setMessageState("Send");
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
    const API_URL: string = "https://api.mistral.ai/v1/chat/completions";

    if (!API_KEY) {
      console.error("API Key is missing");
      return null;
    }

    setIsCurrentlyGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let chatId: string = currentChatId;

    if (isFirstMessage) {
      const createChatRequest = await fetch("/api/proxy/chats", {
        method: "POST",
        body: JSON.stringify({ role: "user", content: prompt })
      });

      if (createChatRequest.status === 201) {
        const data = await createChatRequest.json();
        chatId = data.result.id;
        setCurrentChatId(chatId);
      }
    } else {
      fetch("/api/proxy/chats/append?id=" + chatId, {
        method: "PUT",
        body: JSON.stringify({ role: "user", content: prompt })
      })
    }

    let aiResponse = "";

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
        systemMessage = `!!SEARCH!! Based on recent search results, here is relevant information:\n\n${googleSummary}\n\nNow answer the user's question accurately, and take conscious about the previous message.`;
        console.log("Google Search Results:", resultsArray);
      }

      if (stopGenerate) {
        setIsCurrentlyGenerating(false);
        return null;
      }

      if (isOnlineSearch) {
        await fetch("/api/proxy/chats/append?id=" + chatId, {
          method: "PUT",
          body: JSON.stringify({ role: "user", content: systemMessage })
        });
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
          setMessages([...updatedMessages]);
        }
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.trim() === "[DONE]") {
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

      // Save the final message to the database
      await fetch("/api/proxy/chats/append?id=" + chatId, {
        method: "PUT",
        body: JSON.stringify({ role: "assistant", content: aiResponse })
      });

      setMessages([...updatedMessages]);
      setMessageCount((prev) => Number(prev) + 1);
      setIsCurrentlyGenerating(false);

      if (sendButtonRef.current) {
        setMessageIcon(sendIcon);
        setMessageState("Send");
      }

      return aiResponse;
    } catch (err) {
      console.error("Request error: ", err);

      // Save the partial message to the database if generation is aborted
      if (abortControllerRef.current?.signal.aborted) {
        await fetch("/api/proxy/chats/append?id=" + chatId, {
          method: "PUT",
          body: JSON.stringify({ role: "assistant", content: aiResponse })
        });
      }

      setIsCurrentlyGenerating(false);
      return null;
    }
  };

  return (
    <>
      <Header isLoggedIn={username !== "You"} chatName={currentChatName} chatId={currentChatId} />
      <main>
        <Squares
          speed={0.5}
          squareSize={25}
          direction='down' // up, down, left, right, diagonal
          borderColor='#181818'
          hoverFillColor='#147373'
        />
        <article id="chat" ref={chatRef}>
          <div className="greeting" id="greeting" ref={greetingRef} >
            <Image src={nexodusImage}
              width={400}
              height={400}
              draggable={false}
              priority={true}
              alt="Logo of Nexodus" />
            <h5>Type a prompt below to start chatting.</h5>
          </div>
        </article>
        <article className="messageBox">
          <textarea name="promptArea" id="promptArea" onKeyDown={handleKeyDown} placeholder="Type a prompt..." ref={textareaRef}></textarea>
          <div className="promptBoxButtons">
            <CheckboxSearch checked={isOnlineSearch} setChecked={setIsOnlineSearch} />
            <button data-tooltip-id="messageControl" data-tooltip-content={messageState} onClick={handleButton} ref={sendButtonRef}>
              <Image src={messageIcon}
                width={32}
                height={32}
                draggable={false}
                alt="Send Icon" />
            </button>
            <Tooltip id="messageControl" style={{ borderRadius: 10, backgroundColor: "black" }} />
          </div>
        </article>
        <ChatList />
      </main>
    </>
  );
}

export default Home;