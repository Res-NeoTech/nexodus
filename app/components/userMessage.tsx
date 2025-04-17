import React from "react";
import ReactMarkdown from 'react-markdown';

const UserMessageBox = ({ username, message }: { username: string; message: string }) => {
    return (
        <>
            <h1>{username}</h1>
            <div>
                <ReactMarkdown>{message}</ReactMarkdown>
            </div>
        </>
    );
}

export default UserMessageBox;