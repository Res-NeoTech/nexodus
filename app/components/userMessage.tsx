import React from "react";
import ReactMarkdown from 'react-markdown';

const UserMessageBox = ({ message }: { message: string }) => {
    return (
        <>
            <h1>You</h1>
            <div>
                <ReactMarkdown>{message}</ReactMarkdown>
            </div>
        </>
    );
}

export default UserMessageBox;