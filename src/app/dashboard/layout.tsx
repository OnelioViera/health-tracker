import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserProfile, UserProfileCompact } from "@/components/user-profile";
import { MobileNav } from "@/components/mobile-nav";
import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo.svg" 
                  alt="MyHealthFirst Logo" 
                  width={32} 
                  height={32} 
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900">MyHealthFirst</span>
              </div>
            </div>
            <DashboardNav />
            <div className="flex-grow" />
            <UserProfile />
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1 h-screen">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="MyHealthFirst Logo" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">MyHealthFirst</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "shadow-lg border border-gray-200",
                  }
                }}
              />
            </div>
          </div>
          
          <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
} 