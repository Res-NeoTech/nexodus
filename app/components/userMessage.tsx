const UserMessageBox = ({ message }: { message: string }) => {
    return (
        <>
            <h3>You</h3>
            <div>
                <p>{message}</p>
            </div>
        </>
    );
}

export default UserMessageBox;