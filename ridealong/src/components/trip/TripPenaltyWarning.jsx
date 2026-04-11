import React from 'react';

export default function TripPenaltyWarning({ trip, router }) {
    if (!trip || trip.status !== 'cancelled' || !trip.cancelReason) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
            <div className="bg-red-950/40 border-2 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.4)] p-10 rounded-3xl max-w-lg text-center flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500 mb-6 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-3xl font-black text-white mb-4">ACCOUNT STRIKE REGISTERED</h2>
                <p className="text-red-200 text-lg mb-6 leading-relaxed bg-red-900/40 p-4 rounded-xl border border-red-500/30">
                    {trip.cancelReason}
                </p>
                <p className="text-gray-300 font-medium mb-8">
                    Continued algorithmic violations of this nature will inevitably result in your driver profile being structurally banned from the platform. Maintain scheduling reliability.
                </p>
                <button onClick={() => router.push('/dashboard')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/30 transition transform hover:scale-105 active:scale-95">
                    I Understand
                </button>
            </div>
        </div>
    );
}
