import React, { useState } from 'react';
import Image from 'next/image';
import UserProfilePreviewModal from './UserProfilePreviewModal';

export default function TripBookingRequests({
    isDriver,
    bookings,
    trip,
    actionLoading,
    handleBookingAction
}) {
    const [previewUserId, setPreviewUserId] = useState(null);

    if (!isDriver || bookings.length === 0) return null;

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Passenger Requests</h3>
            <div className="flex flex-col gap-3">
                {bookings.map(booking => (
                    <div key={booking._id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3 transition-colors hover:border-slate-600">
                        <div className="flex items-center gap-2 justify-between w-full">
                            <button 
                                onClick={() => setPreviewUserId(booking.rider._id)}
                                className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-slate-700/30 p-2 -ml-2 rounded-xl transition"
                                title="View Passenger Profile"
                            >
                                {booking.rider?.profilePhoto ? (
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden relative">
                                        <Image src={booking.rider.profilePhoto} alt={booking.rider.name} fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                        {booking.rider?.name?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate w-full group-hover:text-orange-400 transition">{booking.rider?.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                                        <span className="capitalize">{booking.rider?.gender || 'Not specified'}</span>
                                        <span>•</span>
                                        <span className="whitespace-nowrap">{booking.seatsBooked} {booking.seatsBooked > 1 ? 'seats' : 'seat'}</span>
                                    </div>
                                </div>
                            </button>
                            <div className="text-right flex-shrink-0">
                                 <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap ${
                                     booking.status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                                     booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                     'bg-red-500/10 text-red-400'
                                 }`}>
                                     {booking.status}
                                 </span>
                            </div>
                        </div>

                        {!booking.pickupLocation?.lat && (
                            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-2 flex items-center gap-2 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <p className="text-xs text-red-300 font-medium">Rider pickup location unavailable.</p>
                            </div>
                        )}

                        {booking.status === 'pending' && trip?.status === 'scheduled' && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleBookingAction(booking._id, 'confirmed')}
                                    disabled={actionLoading === booking._id || trip?.seats < booking.seatsBooked}
                                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition"
                                >
                                    {actionLoading === booking._id ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                    onClick={() => handleBookingAction(booking._id, 'rejected')}
                                    disabled={actionLoading === booking._id}
                                    className="flex-1 bg-red-900/50 hover:bg-red-900 border border-red-700/50 text-red-200 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Profile Overlay Gateway Modal */}
            {previewUserId && (
                <UserProfilePreviewModal 
                    userId={previewUserId} 
                    onClose={() => setPreviewUserId(null)} 
                />
            )}
        </div>
    );
}
