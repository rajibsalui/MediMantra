"use client";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FileText, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MedicalRecordsList({ records = [], emptyMessage = "No medical records found" }) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        <Link href="/patient/medical-records">
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            Upload Medical Record
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div 
          key={record._id} 
          className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-3">
              <FileText className="h-5 w-5" />
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                {record.title || record.documentType || "Medical Document"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(record.uploadDate || record.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {record.fileUrl && (
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            <Link href={`/patient/medical-records/${record._id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
      
      <Link href="/patient/medical-records" className="block">
        <Button variant="outline" className="w-full mt-2">
          View All Records
        </Button>
      </Link>
    </div>
  );
}
