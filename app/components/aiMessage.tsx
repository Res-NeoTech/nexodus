import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";

const AiMessageBox = ({ message }: { message: string }) => {
    const [theme, setTheme] = useState<{ [key: string]: React.CSSProperties }>(window.matchMedia('(prefers-color-scheme: dark)').matches ? dracula : oneLight);

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            setTheme(event.matches ? dracula : oneLight);
        });
    }, [])

    return (
        <>
            <h1>Mistral AI</h1>
            <div className="aiMessageContent">
                <ReactMarkdown
                    components={{
                        code({inline, className, children, ...props }: {inline?: boolean, className?: string, children?: React.ReactNode }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={theme}
                                    language={match[1]}
                                    PreTag="section"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {message}
                </ReactMarkdown>
            </div>
        </>
    );
};

export default AiMessageBox;