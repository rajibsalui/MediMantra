import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <h3 className="text-xl font-medium">Loading appointment system...</h3>
      <p className="text-muted-foreground mt-2">Please wait</p>
    </div>
  );
}