import React from 'react';

export default function SettingsModals({
    showAccountSettings, setShowAccountSettings,
    showPrivacySettings, setShowPrivacySettings,
    showPasswordChange, setShowPasswordChange,
    showDeleteConfirm, setShowDeleteConfirm,
    editName, setEditName, editEmail, setEditEmail,
    currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    deleteConfirmText, setDeleteConfirmText,
    saving, handleSaveSettings, handleChangePassword, handleDeleteAccount,
    user
}) {
    // 1. Account settings
    const renderAccount = () => {
        if (!showAccountSettings) return null;
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button onClick={() => setShowAccountSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button>
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div><label className="text-gray-400 text-sm block mb-2">Full Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div><label className="text-gray-400 text-sm block mb-2">Email</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" /></div>
                  <div className="flex gap-3"><button onClick={handleSaveSettings} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button><button onClick={() => setShowAccountSettings(false)} className="flex-1 bg-slate-800 text-white py-2 rounded-lg">Cancel</button></div>
                </div>
              </div>
            </div>
        );
    };

    // 2. Privacy Modal
    const renderPrivacy = () => {
        if (!showPrivacySettings) return null;
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button onClick={() => setShowPrivacySettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button>
                <h2 className="text-2xl font-bold text-white mb-6">Privacy & Security</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg"><div><p className="text-white">Change Password</p></div><button onClick={() => { setShowPrivacySettings(false); setShowPasswordChange(true); }} className="text-orange-400 font-medium">Change</button></div>
                    <div className="flex items-center justify-between bg-red-900/20 p-4 rounded-lg"><div><p className="text-red-400">Delete Account</p></div><button onClick={() => { setShowPrivacySettings(false); setShowDeleteConfirm(true); }} className="text-red-400 font-medium">Delete</button></div>
                </div>
              </div>
            </div>
        );
    };

    // 3. Password modal
    const renderPassword = () => {
        if (!showPasswordChange) return null;
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                <div className="space-y-3">
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-slate-800 rounded-lg px-4 py-2 text-white" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-slate-800 rounded-lg px-4 py-2 text-white" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full bg-slate-800 rounded-lg px-4 py-2 text-white" />
                  <div className="flex gap-3"><button onClick={handleChangePassword} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-lg">{saving ? "Changing..." : "Change"}</button><button onClick={() => { setShowPasswordChange(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} className="flex-1 bg-slate-800 text-white rounded-lg">Cancel</button></div>
                </div>
              </div>
            </div>
        );
    };

    // 4. Delete Confirm
    const renderDelete = () => {
        if (!showDeleteConfirm) return null;
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-red-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Delete Account?</h2>
                <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg mb-4 text-left"><p className="text-red-300 text-sm">Warning: This is irreversible!</p></div>
                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" className="w-full bg-slate-800 rounded-lg px-4 py-2 text-white mb-4" />
                <div className="flex gap-3"><button onClick={handleDeleteAccount} disabled={saving || deleteConfirmText !== "DELETE"} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Delete</button><button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }} className="flex-1 bg-slate-800 text-white rounded-lg">Cancel</button></div>
              </div>
            </div>
        );
    };

    return <>{renderAccount()}{renderPrivacy()}{renderPassword()}{renderDelete()}</>;
}
