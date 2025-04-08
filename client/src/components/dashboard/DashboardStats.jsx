"use client";

import { 
  Calendar, 
  FileText, 
  Pill, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from "lucide-react";

export default function DashboardStats({ title, value, icon, trend = "neutral", description }) {
  // Icon mapping
  const icons = {
    "calendar": <Calendar className="h-6 w-6" />,
    "file-medical": <FileText className="h-6 w-6" />,
    "prescription": <Pill className="h-6 w-6" />,
    "check-circle": <CheckCircle className="h-6 w-6" />
  };

  // Trend icon and color mapping
  const trendConfig = {
    "up": {
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-green-500"
    },
    "down": {
      icon: <TrendingDown className="h-4 w-4" />,
      color: "text-red-500"
    },
    "neutral": {
      icon: <Minus className="h-4 w-4" />,
      color: "text-slate-500"
    }
  };

  // Get the selected icon or default to calendar
  const selectedIcon = icons[icon] || icons["calendar"];
  const trendDetails = trendConfig[trend] || trendConfig["neutral"];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
          
          {description && (
            <div className={`flex items-center mt-2 text-xs ${trendDetails.color}`}>
              {trendDetails.icon}
              <span className="ml-1">{description}</span>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {selectedIcon}
        </div>
      </div>
    </div>
  );
}
