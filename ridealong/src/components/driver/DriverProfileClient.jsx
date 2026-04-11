"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/api";

export default function DriverProfileClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    aadhaarNumber: "",
    drivingLicenseNumber: "",
    aadhaarImage: null,
    drivingLicenseImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("aadhaarNumber", form.aadhaarNumber);
    formData.append("drivingLicenseNumber", form.drivingLicenseNumber);
    formData.append("aadhaarImage", form.aadhaarImage);
    formData.append("drivingLicenseImage", form.drivingLicenseImage);

    try {
      const res = await fetch(`${getApiUrl()}/api/driver/verify`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        setError("Verification failed");
        setLoading(false);
        return;
      }

      router.push("/create-trip");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <p className="text-red-400 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Aadhaar Number</label>
          <input
            name="aadhaarNumber"
            placeholder="1234-5678-9012"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 border-gray-200 focus:ring-orange-200 text-gray-200 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Aadhaar Card Image</label>
          <input
            type="file"
            name="aadhaarImage"
            onChange={handleFileChange}
            className="w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-400 file:text-blue-950 hover:file:bg-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Driving License Number</label>
          <input
            name="drivingLicenseNumber"
            placeholder="DL-1234567890123"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 border-gray-200 focus:ring-orange-200 text-gray-200 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Driving License Image</label>
          <input
            type="file"
            name="drivingLicenseImage"
            onChange={handleFileChange}
            className="w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-400 file:text-blue-950 hover:file:bg-orange-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-400 text-blue-950 py-3 rounded-lg font-bold hover:bg-orange-500 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit & Continue"}
        </button>
      </form>
    </>
  );
}
