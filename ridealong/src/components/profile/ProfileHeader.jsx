import React from 'react';

export default function ProfileHeader({
    user,
    saving,
    handleProfilePhotoUpload,
    handleRemoveProfilePhoto
}) {
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50 ring-1 ring-white/5 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-orange-500 transition-all duration-300" />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl font-black text-blue-950 shadow-xl shadow-orange-500/10">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {saving && (
                <div className="absolute inset-0 bg-slate-900/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Photo Upload Triggers */}
              <label className="absolute -bottom-2 -right-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500 text-white p-2 rounded-xl shadow-xl cursor-pointer transition-all group-hover:scale-110">
                <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoUpload} disabled={saving} />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-orange-400">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M14.998 10H16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h1.002a2 2 0 001.732-1h6.534a2 2 0 001.73 1z" clipRule="evenodd" />
                </svg>
              </label>

              {user?.profilePhoto && (
                <button 
                  onClick={handleRemoveProfilePhoto} disabled={saving} 
                  className="absolute -top-2 -right-2 bg-red-900/80 hover:bg-red-900 border border-red-800 text-white p-1 rounded-full shadow-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                </button>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-gray-400 mb-3">{user?.email}</p>
              
              <div className="flex gap-2 justify-center md:justify-start">
                <div className="bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                  <span className="text-slate-300 text-xs font-medium capitalize">{user?.gender}</span>
                </div>
                {user?.isDriverVerified && (
                  <div className="bg-green-900/30 px-3 py-1 rounded-full border border-green-800/50 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">Verified Driver</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    );
}
