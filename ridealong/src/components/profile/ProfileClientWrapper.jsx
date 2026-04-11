"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiUrl } from "@/utils/api";
import { useToast } from "@/components/ToastProvider";

// Sub components
import ProfileHeader from "@/components/profile/ProfileHeader";
import AccountInfoSection from "@/components/profile/AccountInfoSection";
import VehicleListSection from "@/components/profile/VehicleListSection";
import AddVehicleModal from "@/components/profile/AddVehicleModal";
import SettingsModals from "@/components/profile/SettingsModals";

export default function ProfileClientWrapper({ initialUser }) {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [user, setUser] = useState(initialUser);
  const [saving, setSaving] = useState(false);

  // States for toggling Modals
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [editName, setEditName] = useState(initialUser?.name || "");
  const [editEmail, setEditEmail] = useState(initialUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [registrationFile, setRegistrationFile] = useState(null);
  const [registrationPreview, setRegistrationPreview] = useState(null);
  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", year: "", color: "", plateNumber: "", seats: "" });

  const maskNumber = (number) => { if (!number) return "Not provided"; const lastFour = number.slice(-4); return "*".repeat(number.length - 4) + lastFour; };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/update`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (!res.ok) { const data = await res.json(); addToast(data.msg || "Failed", "error"); return; }
      const data = await res.json(); setUser(data.user); setShowAccountSettings(false); addToast("Settings saved!", "success");
    } catch (error) { addToast("Failed", "error"); } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { addToast("Please fill all fields", "warning"); return; }
    if (newPassword !== confirmPassword) { addToast("Passwords do not match", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/change-password`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) { const data = await res.json(); addToast(data.msg || "Failed", "error"); return; }
      addToast("Password changed!", "success"); setShowPasswordChange(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch { addToast("Failed", "error"); } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") { addToast('Type "DELETE"', "warning"); return; }
    setSaving(true);
    try {
       await fetch(`${getApiUrl()}/api/auth/delete-account`, { method: "DELETE", credentials: "include" });
       addToast("Account deleted", "success"); router.push("/login");
    } catch { addToast("Failed", "error"); } finally { setSaving(false); }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const previewUrl = URL.createObjectURL(file); setUser({ ...user, profilePhoto: previewUrl });
    setSaving(true);
    try {
      const formData = new FormData(); formData.append("profilePhoto", file);
      const res = await fetch(`${getApiUrl()}/api/profile/photo`, { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (!res.ok) { addToast(data.msg || "Failed", "error"); return; }
      setUser({ ...user, profilePhoto: data.photoPath }); addToast("Photo updated!", "success");
    } catch { addToast("Failed", "error"); } finally { setSaving(false); URL.revokeObjectURL(previewUrl); }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!confirm("Are you sure?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/photo`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setUser({ ...user, profilePhoto: null }); addToast("Photo removed!", "success"); }
    } catch { addToast("Failed", "error"); } finally { setSaving(false); }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.make || !newVehicle.model) { addToast("Vehicle details required", "warning"); return; }
    if (!registrationFile) { addToast("Upload RC Photo", "warning"); return; }
    setVehicleSaving(true);
    try {
      const formData = new FormData();
      formData.append("make", newVehicle.make); formData.append("model", newVehicle.model);
      if (newVehicle.year) formData.append("year", newVehicle.year); if (newVehicle.color) formData.append("color", newVehicle.color);
      if (newVehicle.plateNumber) formData.append("plateNumber", newVehicle.plateNumber); if (newVehicle.seats) formData.append("seats", newVehicle.seats);
      formData.append("registrationImage", registrationFile);

      const res = await fetch(`${getApiUrl()}/api/profile/vehicles`, { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (!res.ok) { addToast(data.msg || "Failed", "error"); return; }
      setUser({ ...user, vehicles: data.vehicles });
      if (data.status === "verified") {
         setNewVehicle({ make: "", model: "", year: "", color: "", plateNumber: "", seats: "" }); setRegistrationFile(null); setRegistrationPreview(null); setShowAddVehicle(false); addToast("Vehicle added!", "success");
      }
    } catch { addToast("Failed to add", "error"); } finally { setVehicleSaving(false); }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/vehicles/${vehicleId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (res.ok) { setUser({ ...user, vehicles: data.vehicles }); addToast("Vehicle removed!", "success"); }
    } catch { addToast("Failed", "error"); }
  };

  const handleSetDefaultVehicle = async (vehicleId) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/vehicles/${vehicleId}`, { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (res.ok) { setUser({ ...user, vehicles: data.vehicles }); addToast("Default vehicle updated!", "success"); }
    } catch { addToast("Failed", "error"); }
  };

  const handleReVerifyVehicle = () => { addToast("Manual re-verify node under integration.", "info"); };

  return (
    <>
      <ProfileHeader user={user} saving={saving} handleProfilePhotoUpload={handleProfilePhotoUpload} handleRemoveProfilePhoto={handleRemoveProfilePhoto} />
      <AccountInfoSection user={user} maskNumber={maskNumber} router={router} />
      <VehicleListSection user={user} setShowAddVehicle={setShowAddVehicle} handleSetDefaultVehicle={handleSetDefaultVehicle} handleDeleteVehicle={handleDeleteVehicle} handleReVerifyVehicle={handleReVerifyVehicle} />
      
      {/* 🔐 Settings & Security Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => setShowAccountSettings(true)} 
          className="bg-slate-800/80 border border-slate-700/50 text-white p-3 rounded-xl hover:bg-slate-700 transition font-medium text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          ⚙️ Account Settings
        </button>

        <button 
          onClick={() => setShowPasswordChange(true)} 
          className="bg-slate-800/80 border border-slate-700/50 text-white p-3 rounded-xl hover:bg-slate-700 transition font-medium text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          🔒 Change Password
        </button>

        <button 
          onClick={() => setShowDeleteConfirm(true)} 
          className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-xl hover:bg-red-900/20 transition font-medium text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          ⚠️ Delete Account
        </button>
      </div>

      <AddVehicleModal showAddVehicle={showAddVehicle} setShowAddVehicle={setShowAddVehicle} newVehicle={newVehicle} setNewVehicle={setNewVehicle} registrationFile={registrationFile} setRegistrationFile={setRegistrationFile} registrationPreview={registrationPreview} setRegistrationPreview={setRegistrationPreview} vehicleSaving={vehicleSaving} handleAddVehicle={handleAddVehicle} />
      <SettingsModals showAccountSettings={showAccountSettings} setShowAccountSettings={setShowAccountSettings} showPrivacySettings={showPrivacySettings} setShowPrivacySettings={setShowPrivacySettings} showPasswordChange={showPasswordChange} setShowPasswordChange={setShowPasswordChange} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} editName={editName} setEditName={setEditName} editEmail={editEmail} setEditEmail={setEditEmail} currentPassword={currentPassword} setCurrentPassword={setCurrentPassword} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} deleteConfirmText={deleteConfirmText} setDeleteConfirmText={setDeleteConfirmText} saving={saving} handleSaveSettings={handleSaveSettings} handleChangePassword={handleChangePassword} handleDeleteAccount={handleDeleteAccount} user={user} />
    </>
  );
}
