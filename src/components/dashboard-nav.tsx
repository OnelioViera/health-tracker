"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Activity,
  Users,
  Stethoscope,
  TrendingUp,
  Calendar,
  FileText,
  Scale,
  Target,
  Mountain,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Blood Pressure",
    href: "/dashboard/blood-pressure",
    icon: Activity,
  },
  {
    name: "Blood Work",
    href: "/dashboard/blood-work",
    icon: CreditCard,
  },
  {
    name: "Weight & Body",
    href: "/dashboard/weight",
    icon: Scale,
  },
  {
    name: "Exercise",
    href: "/dashboard/exercise",
    icon: Mountain,
  },
  {
    name: "Doctor Visits",
    href: "/dashboard/doctor-visits",
    icon: Stethoscope,
  },
  {
    name: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    name: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
];

const accountNavigation = [
  {
    name: "Profile",
    href: "/user-profile",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/user-settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Health Tracking
        </h3>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Account
        </h3>
        {accountNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 