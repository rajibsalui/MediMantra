import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

export default function MedicalDisclaimer({ children }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Medical Disclaimer
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-700 dark:text-slate-300">
            <p className="mb-4">
              The information provided by Mediमंत्र AI is for general informational and educational 
              purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="mb-4">
              Always seek the advice of your physician or other qualified health provider with any 
              questions you may have regarding a medical condition or treatment and before undertaking 
              a new health care regimen.
            </p>
            <p>
              Never disregard professional medical advice or delay in seeking it because of something 
              you have read or heard from our AI assistant.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
            I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
