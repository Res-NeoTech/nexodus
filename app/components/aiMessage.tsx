import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copyToClipboard } from "../utils/deviceManagement";
import rehypeSanitize from "rehype-sanitize";

const AiMessageBox = ({ message }: { message: string }) => {
    return (
        <>
            <h1>Mistral AI</h1>
            <div className="aiMessageContent">
                <ReactMarkdown
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                        code({ inline, className, children, ...props }: { inline?: boolean, className?: string, children?: React.ReactNode }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const code : string = String(children).replace(/\n$/, "")
                            return !inline && match ? (
                                <>
                                    <div id="codeInfo">
                                        <h4>{match[1]}</h4>
                                        <button onClick={() => copyToClipboard(code)}>Copy</button>
                                    </div>
                                    <SyntaxHighlighter
                                        style={dracula}
                                        language={match[1]}
                                        PreTag="section"
                                        {...props}
                                    >
                                        {code}
                                    </SyntaxHighlighter>
                                </>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {(message)}
                </ReactMarkdown>
            </div>
        </>
    );
};

export default AiMessageBox;