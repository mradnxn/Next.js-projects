import React from 'react';

export default function AccountInfoSection({
    user,
    maskNumber,
    router
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Account Information */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50 ring-1 ring-white/5">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
              </svg>
              Account Information
            </h3>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm">Full Name</label><p className="text-white font-medium">{user?.name}</p></div>
              <div><label className="text-gray-400 text-sm">Email Address</label><p className="text-white font-medium">{user?.email}</p></div>
              <div><label className="text-gray-400 text-sm">Gender</label><p className="text-white font-medium capitalize">{user?.gender}</p></div>
              <div><label className="text-gray-400 text-sm">Member Since</label><p className="text-white font-medium">{new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50 ring-1 ring-white/5">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>
              Driver Information
            </h3>
            {user?.isDriverVerified ? (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 flex items-center gap-2 mb-2">
                  <span className="text-green-400 font-semibold">Verified Driver Authorization</span>
                </div>
                <div><label className="text-gray-400 text-sm">Aadhaar Number</label><p className="text-white font-medium font-mono">{maskNumber(user?.aadhaarNumber)}</p></div>
                <div><label className="text-gray-400 text-sm">Driving License Number</label><p className="text-white font-medium font-mono">{maskNumber(user?.drivingLicenseNumber)}</p></div>
              </div>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex flex-col gap-2">
                <p className="text-yellow-400 font-semibold">Verification Pending</p>
                <p className="text-gray-300 text-sm">Complete driver verification to start offering rides.</p>
                <button onClick={() => router.push("/driver/profile")} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-fit mt-2">Get Verified</button>
              </div>
            )}
          </div>
        </div>
    );
}
