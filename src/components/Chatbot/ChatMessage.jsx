import React from 'react';

function ChatMessage({ message, isUser }) {
    return (
        <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
            <div className="chat-message-avatar">
                {isUser ? (
                    <div className="avatar-user">
                        {message.userName?.charAt(0) || 'U'}
                    </div>
                ) : (
                    <div className="avatar-ai">
                        🤖
                    </div>
                )}
            </div>
            <div className="chat-message-content">
                <div className={`chat-bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}>
                    {message.content}
                </div>
                <div className="chat-message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );
}

export default ChatMessage;
