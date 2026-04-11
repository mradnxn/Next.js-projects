import React from 'react';

export default function TripLiveChat({
    activeTab,
    messages,
    currentUser,
    newMessage,
    setNewMessage,
    handleSendMessage,
    messagesEndRef,
    sending
}) {
    if (activeTab !== 'chat') return null;

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 custom-scrollbar">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-10">No messages yet. Send a message to coordinate!</p>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                        return (
                            <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl ${
                                    isMe 
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-none shadow-lg shadow-orange-500/10' 
                                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50'
                                }`}>
                                    {!isMe && (
                                        <p className="text-[10px] font-bold text-orange-400 mb-1">
                                            {msg.sender?.name || "User"}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                                    <p className="text-right text-[9px] opacity-60 mt-1">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto pt-2 border-t border-slate-800/80">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 bg-slate-900/80 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center font-bold text-sm"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
