import React from 'react';
import UserStatsClient from '../user/UserStatsClient';

export default function UserProfilePreviewModal({ userId, onClose }) {
    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col relative shadow-2xl">
                
                {/* Sticky Header with Close Button */}
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4 pointer-events-none">
                    <button 
                        onClick={onClose}
                        className="pointer-events-auto bg-slate-800/80 hover:bg-red-500/80 text-white rounded-full p-2 transition-colors backdrop-blur-md border border-slate-600 shadow-xl"
                        title="Close Profile Preview"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Profile Architecture Component */}
                <div className="-mt-16 pb-8">
                    <UserStatsClient userId={userId} />
                </div>
            </div>
        </div>
    );
}
