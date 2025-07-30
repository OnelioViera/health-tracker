"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home,
  Activity,
  TrendingUp,
  User,
  Menu,
  CreditCard,
  Stethoscope,
  Scale,
  Calendar,
  LogOut,
  Pill
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "./dashboard-nav";

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className="md:hidden">
      {/* Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="fixed top-4 right-4 z-[100] md:hidden bg-white rounded-lg shadow-md p-2 border border-gray-200">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-xl font-bold text-gray-900">MyHealthFirst</span>
              </div>
            </div>
            <DashboardNav />
            <div className="flex-grow" />
            <div className="p-4 border-t border-gray-200">
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 