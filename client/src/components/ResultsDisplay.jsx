'use client';

import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw,
  User,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ResultsDisplay({ results, onReset }) {
  // Define urgency level colors and icons
  const urgencyConfig = {
    Low: {
      color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
      icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    },
    Medium: {
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    },
    High: {
      color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
      icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
  };

  const urgencyStyle = urgencyConfig[results.urgencyLevel] || urgencyConfig.Medium;
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-md border-t-4 border-t-blue-500 dark:border-t-blue-400 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl dark:text-gray-100">Analysis Results</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Based on the information you provided
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgency Level</h3>
                <div className="mt-1 flex items-center gap-2">
                  {urgencyStyle.icon}
                  <span className="font-medium dark:text-gray-200">{results.urgencyLevel}</span>
                </div>
              </div>
              
              <Badge className={`px-3 py-1 text-sm ${urgencyStyle.color}`}>
                {results.urgencyLevel === "High" 
                  ? "Seek medical attention soon" 
                  : results.urgencyLevel === "Medium" 
                    ? "Follow up with a doctor" 
                    : "Monitor your condition"}
              </Badge>
            </div>
            
            <Separator className="dark:bg-gray-600" />
            
            {/* Possible conditions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">Possible Considerations</h3>
              <ul className="space-y-2">
                {results.possibleConditions.map((condition, index) => (
                  <li key={index} className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm dark:text-gray-200">
                    {condition}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                These are not diagnoses, but potential considerations to discuss with your doctor.
              </p>
            </div>
            
            <Separator className="dark:bg-gray-600" />
            
            {/* Specialist recommendation */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium dark:text-gray-200">Suggested Specialist</h3>
                <p className="text-sm dark:text-gray-300">{results.suggestedSpecialist}</p>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <ArrowRight className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Relevant questions */}
            {results.relevantQuestions && results.relevantQuestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions Your Doctor May Ask</h3>
                </div>
                <ul className="pl-6 space-y-1">
                  {results.relevantQuestions.map((question, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 list-disc">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-start pt-2">
            <div className="flex items-start gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md w-full">
              <ShieldAlert className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <p>{results.disclaimer}</p>
            </div>
            <Button onClick={onReset} variant="outline" className="gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <RotateCcw className="h-4 w-4" />
              Start New Analysis
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
