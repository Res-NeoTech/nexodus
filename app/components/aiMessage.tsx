import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const AiMessageBox = ({ message }: { message: string }) => {
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
                                    style={dracula}
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