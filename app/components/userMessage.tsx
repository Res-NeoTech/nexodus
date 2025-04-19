import React from "react";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from "rehype-sanitize";

const UserMessageBox = ({ username, message }: { username: string; message: string }) => {
    message = message.replaceAll("<", "&lt;");
    message = message.replaceAll(">", "&gt;");
    return (
        <>
            <h1>{username}</h1>
            <div>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{message}</ReactMarkdown>
            </div>
        </>
    );
}

export default UserMessageBox;