import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
      <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">Loading appointment system...</h3>
      <p className="text-slate-600 dark:text-slate-400 mt-2">Please wait</p>
    </div>
  );
}