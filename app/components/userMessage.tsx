import React from "react";
import ReactMarkdown from 'react-markdown';

const UserMessageBox = ({ message }: { message: string }) => {
    return (
        <>
            <h3>You</h3>
            <div>
                <ReactMarkdown>{message}</ReactMarkdown>
            </div>
        </>
    );
}

export default UserMessageBox;