"use client";

import { useState } from "react";
import { getApiUrl } from "@/utils/api";

export default function TripRatingModal({ trip, targetUser, onSuccess, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/trips/${trip._id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId: targetUser._id || targetUser, rating, comment })
      });
      if (res.ok) {
        onSuccess(targetUser._id || targetUser);
      } else {
        const data = await res.json();
        alert(data.msg || "Server feedback rejection");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
       <div className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl w-full max-w-md shadow-[0_0_80px_rgba(249,115,22,0.1)] flex flex-col items-center relative overflow-hidden">
           {/* Abstract Glow Background */}
           <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-orange-500/20 to-transparent -z-10 blur-xl"></div>
           
           <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-[4px] border-slate-800 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
               {targetUser?.profilePhoto ? (
                  <img src={targetUser.profilePhoto} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-4xl font-extrabold text-white capitalize shadow-inner">
                      {targetUser?.name ? targetUser.name.charAt(0) : "D"}
                  </div>
               )}
           </div>
           
           <h2 className="text-3xl font-black text-white text-center tracking-tight">
               {trip?.status === 'cancelled' ? 'Trip Cancelled' : 'Rate Your Journey'}
           </h2>
           <p className="text-gray-400 text-sm text-center mt-2 mb-8 leading-relaxed px-4">
               {trip?.status === 'cancelled' ? (
                   <>
                       We sincerely apologize!{" "}
                       <span className="text-white font-medium">
                           {trip?.cancelReason ? trip.cancelReason : `Your driver ${targetUser?.name || "driver"} had to cancel the trip.`}
                       </span>{" "}
                       Please let us know your feedback.
                   </>
               ) : (
                   <>How was your experience riding with <span className="text-white font-bold">{targetUser?.name || "your driver"}</span> on this trip?</>
               )}
           </p>

           <div className="flex gap-3 mb-8" onMouseLeave={() => setHoverRating(0)}>
             {[1, 2, 3, 4, 5].map((star) => (
               <button 
                 key={star} 
                 onClick={() => setRating(star)}
                 onMouseEnter={() => setHoverRating(star)}
                 className="transform transition-all hover:scale-125 focus:outline-none"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? (trip?.status === 'cancelled' ? '#ef4444' : '#f97316') : "transparent"} stroke={star <= (hoverRating || rating) ? (trip?.status === 'cancelled' ? '#ef4444' : '#f97316') : "#475569"} className={`w-12 h-12 stroke-[1.5px] transition-colors ${star <= (hoverRating || rating) ? (trip?.status === 'cancelled' ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]') : ''}`}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                 </svg>
               </button>
             ))}
           </div>

           <textarea 
             placeholder={rating >= 4 ? `Leave a glowing compliment for ${targetUser?.name?.split(' ')[0] || 'the driver'}...` : "What could have gone better? Leave constructive feedback..."}
             value={comment}
             onChange={e => setComment(e.target.value)}
             className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-orange-500/50 outline-none resize-none h-28 mb-6 placeholder-gray-600 transition"
           />

           <div className="flex gap-4 w-full">
             <button onClick={onSkip} className="flex-[0.4] py-3.5 text-sm font-semibold text-gray-500 hover:text-white bg-transparent hover:bg-slate-800 rounded-xl transition">Not Now</button>
             <button onClick={handleSubmit} disabled={rating === 0 || loading} className={`flex-1 py-3.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg ${rating > 0 ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 transform active:scale-95" : "bg-slate-800 cursor-not-allowed opacity-40 text-gray-500"}`}>
                 {loading ? 'Submitting...' : 'Submit Rating'}
             </button>
           </div>
       </div>
    </div>
  );
}
