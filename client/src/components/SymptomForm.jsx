"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema
const formSchema = z.object({
  age: z.string().refine(val => !val || (!isNaN(val) && parseInt(val) > 0 && parseInt(val) < 120), {
    message: "Age must be between 1-120 years",
  }).optional(),
  gender: z.string().optional(),
  symptoms: z.string().min(5, {
    message: "Please describe your symptoms (minimum 5 characters)",
  }),
  duration: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export default function SymptomForm({ onSubmit }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit: hookFormSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: '',
      gender: '',
      symptoms: '',
      duration: '',
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      additionalInfo: '',
    },
  });

  const onFormSubmit = async (data) => {
    setError('');
    if (!data.symptoms || data.symptoms.trim() === '') {
      setError('Please describe your symptoms');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto">
      <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-5">Symptom Analysis</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={hookFormSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
            <input
              id="age"
              type="text"
              placeholder="Enter age"
              className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.age ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                dark:bg-gray-700 bg-gray-100 text-black dark:text-gray-100`}
              {...register('age')}
            />
            {errors.age && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.age.message}</p>}
          </div>
          
          <div className="space-y-1">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
            <select
              id="gender"
              className={`w-full bg-gray-100 h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.gender ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                dark:bg-gray-700 dark:text-gray-100`}
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.gender.message}</p>}
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Primary Symptoms <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            id="symptoms"
            placeholder="Describe your symptoms in detail"
            className={`w-full bg-gray-100 min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${errors.symptoms ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} 
              dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
            {...register('symptoms')}
          ></textarea>
          {errors.symptoms && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.symptoms.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
          <select
            id="duration"
            className={`w-full bg-gray-100 h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${errors.duration ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} 
              dark:bg-gray-700 dark:text-gray-100`}
            {...register('duration')}
          >
            <option value="">How long have you had these symptoms?</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
          {errors.duration && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.duration.message}</p>}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Additional Information</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Medical History</label>
              <textarea
                id="medicalHistory"
                placeholder="Any chronic conditions or previous surgeries"
                className="w-full bg-gray-100 min-h-[80px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                {...register('medicalHistory')}
              ></textarea>
              {errors.medicalHistory && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.medicalHistory.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Medications</label>
                <textarea
                  id="currentMedications"
                  placeholder="Current medications"
                  className="w-full bg-gray-100 min-h-[80px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  {...register('currentMedications')}
                ></textarea>
                {errors.currentMedications && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.currentMedications.message}</p>}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Allergies</label>
                <textarea
                  id="allergies"
                  placeholder="Known allergies"
                  className="w-full bg-gray-100 min-h-[80px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  {...register('allergies')}
                ></textarea>
                {errors.allergies && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.allergies.message}</p>}
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Other Information</label>
              <textarea
                id="additionalInfo"
                placeholder="Any other details that might be relevant"
                className="w-full bg-gray-100 min-h-[80px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                {...register('additionalInfo')}
              ></textarea>
              {errors.additionalInfo && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.additionalInfo.message}</p>}
            </div>
          </div>
        </div>
        
        <div className="pt-2 flex justify-end">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Analyze Symptoms"
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-gray-600 dark:text-gray-300 border border-blue-100 dark:border-blue-800/50">
        <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Note:</p>
        <p>This tool provides informational insights only, not medical diagnoses. Always consult with a healthcare professional for proper medical advice.</p>
      </div>
    </div>
  );
}
