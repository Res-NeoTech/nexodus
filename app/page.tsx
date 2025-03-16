"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import "./styles/chat.scss";
import nexodusImage from "../public/nexodus.png";

function Home() {
  const greetingRef = useRef<HTMLDivElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true);

  const hideGreeting = () => {
    if(isFirstMessage){
      setIsFirstMessage(false);
      greetingRef.current?.remove();
    }
  }

  return (
    <>
      <main>
        <div className="greeting" id="greeting" ref={greetingRef} >
          <Image src={nexodusImage}
            width={400}
            height={400}
            draggable={false}
            alt="Picture of the author" />
            <h5>Type a prompt below to start chatting.</h5>
        </div>
        <div className="messageBox">
          <textarea name="promptArea" id="promptArea" placeholder="Type a prompt..."></textarea>
          <button onClick={hideGreeting}>Send</button>
        </div>
      </main>
    </>
  );
}

export default Home;