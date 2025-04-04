"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  MoreHorizontal,
  BadgeCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';

export default function RecentVisits({ visits = [], user, isLoading, error, onRetry }) {
  const [expandedVisitId, setExpandedVisitId] = useState(null);
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  // Format time
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  // Toggle visit details expansion
  const toggleExpand = (visitId) => {
    if (expandedVisitId === visitId) {
      setExpandedVisitId(null);
    } else {
      setExpandedVisitId(visitId);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-gray-700 mb-4">{error.message || "Failed to load recent visits"}</p>
            <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Sort visits by date (most recent first)
  const sortedVisits = [...visits].sort((a, b) => 
    new Date(b.date || b.visitDate) - new Date(a.date || a.visitDate)
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Recent Visits</CardTitle>
        <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
          View All Visits
        </Button>
      </CardHeader>
      <CardContent>
        {sortedVisits.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Stethoscope className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No medical visits yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Your visit history will appear here after you see a doctor
            </p>
            <Button variant="outline" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
              Schedule a Visit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedVisits.slice(0, 5).map((visit, index) => (
              <motion.div 
                key={visit.id || index}
                layout
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => toggleExpand(visit.id || index)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {visit.visitType || "Consultation"}
                        </span>
                        {visit.isPrimary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Primary Care
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {visit.provider || visit.doctorName || "Dr. " + visit.doctor?.lastName || "Unknown Provider"}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(visit.date || visit.visitDate)}
                      </div>
                      {visit.time && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="h-3 w-3 mr-1.5" />
                          {visit.time}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    {visit.reason && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500 dark:text-gray-400">Reason:</span> {visit.reason}
                      </div>
                    )}
                    
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedVisitId === (visit.id || index) ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {expandedVisitId === (visit.id || index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-3">
                        {visit.diagnosis && (
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{visit.diagnosis}</p>
                          </div>
                        )}
                        
                        {visit.treatment && (
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Treatment:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{visit.treatment}</p>
                          </div>
                        )}
                        
                        {visit.notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{visit.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Download Report</DropdownMenuItem>
                              <DropdownMenuItem>View Prescriptions</DropdownMenuItem>
                              <DropdownMenuItem>Request Clarification</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
            
            {sortedVisits.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="link" className="text-blue-600 hover:text-blue-800">
                  View {sortedVisits.length - 5} more visits
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
