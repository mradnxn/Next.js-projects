import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import bg from "@/../public/Ride_along_bg.png";

// Client Sub-component
import DriverProfileClient from "@/components/driver/DriverProfileClient";

export const metadata = {
  title: "Driver Verification | RideAlong",
  description: "Submit your KYC details including Aadhaar and driving license to get verified as a reliable driver on RideAlong.",
};

export default async function DriverProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let user = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      method: "GET",
      headers: { Cookie: `token=${token}` },
    });

    if (!res.ok) {
      redirect("/login");
    }

    user = await res.json();
    
    // Redirect if already verified
    if (user?.isDriverVerified) {
        redirect("/create-trip");
    }
  } catch (error) {
    console.error("Driver Profile SSR Fetch Error:", error);
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <Image
        src={bg}
        alt="background"
        fill
        className="object-cover blur-sm -z-10"
      />
      
      <div className="w-full max-w-lg bg-blue-950/90 p-8 rounded-2xl shadow-md z-10">
        
        {/* Static Heading */}
        <h1 className="text-2xl font-semibold mb-4 text-white">
          Driver Verification
        </h1>

        {/* Client Form Data Layout */}
        <DriverProfileClient />
      </div>
    </div>
  );
}
