import React from "react";
import ReactMarkdown from 'react-markdown';

const AiMessageBox = ({ message }: { message: string }) => {
    return (
        <>
            <h3>Le Chat</h3>
            <div>
                <ReactMarkdown>{message}</ReactMarkdown>
            </div>
        </>
    );
}

export default AiMessageBox;