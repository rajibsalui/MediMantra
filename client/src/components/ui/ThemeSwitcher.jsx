"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { 
  FiSun, FiMoon, FiMonitor, FiCheck 
} from "react-icons/fi";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we can safely show the theme switcher
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 rounded-full transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          {theme === 'light' && <FiSun className="h-4 w-4 text-amber-500" />}
          {theme === 'dark' && <FiMoon className="h-4 w-4 text-indigo-400" />}
          {theme === 'system' && <FiMonitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-1">
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setTheme("light")}
          >
            <FiSun className="h-4 w-4 text-amber-500" />
            <span className="dark:text-gray-200">Light</span>
            {theme === "light" && <FiCheck className="h-4 w-4 ml-auto text-green-500" />}
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setTheme("dark")}
          >
            <FiMoon className="h-4 w-4 text-indigo-400" />
            <span className="dark:text-gray-200">Dark</span>
            {theme === "dark" && <FiCheck className="h-4 w-4 ml-auto text-green-500" />}
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setTheme("system")}
          >
            <FiMonitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="dark:text-gray-200">System</span>
            {theme === "system" && <FiCheck className="h-4 w-4 ml-auto text-green-500" />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
