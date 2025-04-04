"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePatient } from '@/contexts/PatientContext';

// Form validation schema
const formSchema = z.object({
  systolic: z.string()
    .refine(val => !val || (!isNaN(val) && parseInt(val) >= 70 && parseInt(val) <= 200), {
      message: "Systolic pressure should be between 70-200 mmHg",
    }).optional(),
  diastolic: z.string()
    .refine(val => !val || (!isNaN(val) && parseInt(val) >= 40 && parseInt(val) <= 120), {
      message: "Diastolic pressure should be between 40-120 mmHg",
    }).optional(),
  heartRate: z.string()
    .refine(val => !val || (!isNaN(val) && parseInt(val) >= 40 && parseInt(val) <= 200), {
      message: "Heart rate should be between 40-200 BPM",
    }).optional(),
  glucoseLevel: z.string()
    .refine(val => !val || (!isNaN(val) && parseInt(val) >= 30 && parseInt(val) <= 600), {
      message: "Glucose level should be between 30-600 mg/dL",
    }).optional(),
  weight: z.string()
    .refine(val => !val || (!isNaN(val) && parseFloat(val) > 0 && parseFloat(val) <= 500), {
      message: "Weight should be a positive number up to 500 kg",
    }).optional(),
  temperature: z.string()
    .refine(val => !val || (!isNaN(val) && parseFloat(val) >= 35 && parseFloat(val) <= 42), {
      message: "Temperature should be between 35-42°C",
    }).optional(),
  oxygenSaturation: z.string()
    .refine(val => !val || (!isNaN(val) && parseInt(val) >= 70 && parseInt(val) <= 100), {
      message: "Oxygen saturation should be between 70-100%",
    }).optional(),
  notes: z.string().max(500, {
    message: "Notes must not exceed 500 characters",
  }).optional(),
});

export default function VitalStatForm({ onAddSuccess }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const { addVitalStats, loading } = usePatient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur"
  });
  
  const onSubmit = async (data) => {
    // Check if at least one vital stat is provided
    const hasValue = Object.values(data).some(val => val && val !== '');
    
    if (!hasValue) {
      setError('Please enter at least one vital measurement');
      return;
    }
    
    setError('');
    
    try {
      // Format data for API
      const formattedData = {
        date: new Date().toISOString(),
        bloodPressure: data.systolic && data.diastolic ? {
          systolic: parseInt(data.systolic),
          diastolic: parseInt(data.diastolic)
        } : undefined,
        heartRate: data.heartRate ? parseInt(data.heartRate) : undefined,
        glucoseLevel: data.glucoseLevel ? parseInt(data.glucoseLevel) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        temperature: data.temperature ? parseFloat(data.temperature) : undefined,
        oxygenSaturation: data.oxygenSaturation ? parseInt(data.oxygenSaturation) : undefined,
        notes: data.notes
      };
      
      // Remove undefined fields
      Object.keys(formattedData).forEach(key => 
        formattedData[key] === undefined && delete formattedData[key]
      );
      
      // Only proceed if we have at least one measurement
      if (Object.keys(formattedData).length <= 2 && !formattedData.bloodPressure) {
        setError('Please enter at least one vital measurement');
        return;
      }
      
      await addVitalStats(formattedData);
      toast.success("Vital statistics recorded successfully");
      
      // Close dialog and reset form
      reset();
      setOpen(false);
      
      // Call success callback to update parent component
      if (onAddSuccess) onAddSuccess();
      
    } catch (err) {
      console.error("Error adding vital stats:", err);
      toast.error(err.message || "Failed to record vital statistics");
      setError(err.message || "An error occurred while saving your data");
    }
  };
  
  const handleDialogChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form and errors when dialog closes
      reset();
      setError('');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1.5 border-dashed">
          <Plus className="h-4 w-4" />
          Record Vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Vital Statistics</DialogTitle>
          <DialogDescription>
            Enter your current vital statistics to track your health over time.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">Blood Pressure (Systolic - mmHg)</Label>
              <Input
                id="systolic"
                placeholder="120"
                {...register("systolic")}
              />
              {errors.systolic && (
                <p className="text-xs text-red-500">{errors.systolic.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diastolic">Blood Pressure (Diastolic - mmHg)</Label>
              <Input
                id="diastolic"
                placeholder="80"
                {...register("diastolic")}
              />
              {errors.diastolic && (
                <p className="text-xs text-red-500">{errors.diastolic.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
              <Input
                id="heartRate"
                placeholder="75"
                {...register("heartRate")}
              />
              {errors.heartRate && (
                <p className="text-xs text-red-500">{errors.heartRate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
              <Input
                id="oxygenSaturation"
                placeholder="98"
                {...register("oxygenSaturation")}
              />
              {errors.oxygenSaturation && (
                <p className="text-xs text-red-500">{errors.oxygenSaturation.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                placeholder="36.8"
                {...register("temperature")}
              />
              {errors.temperature && (
                <p className="text-xs text-red-500">{errors.temperature.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                placeholder="70"
                {...register("weight")}
              />
              {errors.weight && (
                <p className="text-xs text-red-500">{errors.weight.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="glucoseLevel">Glucose (mg/dL)</Label>
              <Input
                id="glucoseLevel"
                placeholder="100"
                {...register("glucoseLevel")}
              />
              {errors.glucoseLevel && (
                <p className="text-xs text-red-500">{errors.glucoseLevel.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Any additional notes"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Vitals"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
