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
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    Medium: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Clock className="h-5 w-5 text-amber-600" />
    },
    High: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />
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
        <Card className="shadow-md border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Analysis Results</CardTitle>
            <CardDescription>
              Based on the information you provided
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Urgency Level</h3>
                <div className="mt-1 flex items-center gap-2">
                  {urgencyStyle.icon}
                  <span className="font-medium">{results.urgencyLevel}</span>
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
            
            <Separator />
            
            {/* Possible conditions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Possible Considerations</h3>
              <ul className="space-y-2">
                {results.possibleConditions.map((condition, index) => (
                  <li key={index} className="bg-gray-50 rounded-md p-3 text-sm">
                    {condition}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                These are not diagnoses, but potential considerations to discuss with your doctor.
              </p>
            </div>
            
            <Separator />
            
            {/* Specialist recommendation */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Suggested Specialist</h3>
                <p className="text-sm">{results.suggestedSpecialist}</p>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-2 text-sm text-blue-800">
                    <ArrowRight className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Relevant questions */}
            {results.relevantQuestions && results.relevantQuestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">Questions Your Doctor May Ask</h3>
                </div>
                <ul className="pl-6 space-y-1">
                  {results.relevantQuestions.map((question, index) => (
                    <li key={index} className="text-sm text-gray-600 list-disc">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-start pt-2">
            <div className="flex items-start gap-2 mb-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-md w-full">
              <ShieldAlert className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p>{results.disclaimer}</p>
            </div>
            <Button onClick={onReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Start New Analysis
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
