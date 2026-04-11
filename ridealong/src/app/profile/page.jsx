import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import bg from "@/../public/Ride_along_bg.png";
import { getApiUrl } from "@/utils/api";
import Link from "next/link";

export const metadata = {
  title: "Profile Dashboard | RideAlong",
  description: "Manage your personal account details, driver verifications, and vehicle settings securely with RideAlong.",
};

// Client Sub-component
import ProfileClientWrapper from "@/components/profile/ProfileClientWrapper";

export default async function ProfilePage() {
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
  } catch (error) {
    console.error("Profile SSR Fetch Error:", error);
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative p-6 bg-[#020617]">
      <Image src={bg} alt="background" fill className="object-cover opacity-20 blur-md -z-10" />
      
      <div className="max-w-4xl mx-auto py-12">
        
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Back</Link>
          <h1 className="text-2xl font-black text-white">Dashboard Profile</h1>
          <div className="w-10"></div> 
        </div>

        <ProfileClientWrapper initialUser={user} />
      </div>
    </div>
  );
}
