import React, { useState, useRef } from 'react';
import apiService from '../../services/apiService';

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null); // For image preview
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('handleSubmit called', { message, file, isSending });

        if ((!message.trim() && !file) || isSending) {
            console.log('Validation failed - empty message or already sending');
            return;
        }

        setIsSending(true);
        try {
            let attachments = [];

            // Upload file if present
            if (file) {
                console.log('📎 Uploading file:', file.name);
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const uploadResponse = await apiService.post('/chat/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    console.log('✅ File uploaded:', uploadResponse);
                    attachments = [uploadResponse];
                } catch (uploadError) {
                    console.error('❌ File upload failed:', uploadError);
                    // Continue sending message even if file upload fails
                }
            }

            console.log('Calling onSend with message and attachments:', { message, attachments });
            await onSend(message, attachments);
            console.log('onSend completed successfully');
            setMessage('');
            setFile(null);
            setFilePreview(null); // Clear preview
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Generate preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null); // No preview for non-images
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            {/* Main Input Container */}
            <div className="bg-background border border-border rounded-2xl p-2 shadow-sm">
                {/* File Preview - Inside the container */}
                {file && (
                    <div className="bg-surface p-2 rounded-lg mb-2 border border-border">
                        {filePreview ? (
                            // Image preview
                            <div className="flex items-start gap-2">
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded border border-border"
                                />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-text block truncate">{file.name}</span>
                                    <span className="text-xs text-textSecondary">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-background rounded-full text-textSecondary hover:text-error transition-colors flex-shrink-0"
                                    title="Remove file"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            // File icon for non-images
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded">
                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </div>
                                <span className="text-sm truncate flex-1 text-text">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-background rounded-full text-textSecondary hover:text-error transition-colors"
                                    title="Remove file"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Input Row */}
                <div className="flex gap-2 items-center">
                    {/* File Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-textSecondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex-shrink-0"
                        title="Attach file"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />

                    {/* Text Input */}
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={file ? "Add a caption (optional)..." : "Type a message..."}
                        className="flex-1 bg-transparent px-2 py-2 text-text focus:outline-none placeholder:text-textSecondary"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={isSending || (!message.trim() && !file)}
                        className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0"
                        title="Send message"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default MessageInput;
