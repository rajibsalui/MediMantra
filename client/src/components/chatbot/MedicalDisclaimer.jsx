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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Medical Disclaimer
          </AlertDialogTitle>
          <AlertDialogDescription>
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
          <AlertDialogAction>I understand</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
