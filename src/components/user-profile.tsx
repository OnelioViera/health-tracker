"use client";

import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Settings, 
  LogOut, 
  Mail,
  Calendar,
  Shield
} from "lucide-react";
import Link from "next/link";

export function UserProfile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className="p-3 border-t border-gray-200">
      <div className="flex items-center space-x-2 mb-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gray-900 truncate">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.username || "User"
            }
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        onClick={handleSignOut}
      >
        <LogOut className="h-3 w-3 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}

export function UserProfileCompact() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="p-3 border-t border-gray-200">
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-gray-200">
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-6 h-6",
            userButtonPopoverCard: "shadow-lg border border-gray-200",
            userButtonPopoverRoot: "z-50",
            userButtonPopoverContent: "shadow-lg border border-gray-200",
          }
        }}
      />
    </div>
  );
} 