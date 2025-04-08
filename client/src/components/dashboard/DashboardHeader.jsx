"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader({ title, subtitle, user, profile }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      </div>
      
      <div className="flex items-center mt-4 md:mt-0 space-x-4">
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile?.bloodGroup ? `Blood Group: ${profile.bloodGroup}` : 'Patient'}
            </p>
          </div>
          
          <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
            <AvatarImage 
              src={user?.profileImage || "/default-avatar.png"} 
              alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
            />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
