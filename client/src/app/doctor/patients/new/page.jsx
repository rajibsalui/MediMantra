"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { API_URL } from "@/config/environment";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  gender: z.string().min(1, "Please select a gender"),
  bloodGroup: z.string().optional(),
  height: z.object({
    value: z.number().optional().nullable(),
    unit: z.string().optional(),
  }).optional(),
  weight: z.object({
    value: z.number().optional().nullable(),
    unit: z.string().optional(),
  }).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  allergies: z.array(
    z.object({
      name: z.string(),
      severity: z.string(),
      reaction: z.string().optional(),
    })
  ).optional(),
  chronicConditions: z.array(
    z.object({
      name: z.string(),
      diagnosedDate: z.string().optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  currentMedications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      startDate: z.string().optional(),
    })
  ).optional(),
  notes: z.string().optional(),
});
// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export default function NewPatientPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [allergies, setAllergies] = useState([{ name: "", severity: "mild", reaction: "" }]);
  const [conditions, setConditions] = useState([{ name: "", diagnosedDate: "", notes: "" }]);
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "", startDate: "" }]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "unknown",
      height: { value: null, unit: "cm" },
      weight: { value: null, unit: "kg" },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      notes: "",
    },
  });

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Handle form submission
  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Add allergies, conditions, and medications to the form values
      values.allergies = allergies.filter(a => a.name.trim() !== "");
      values.chronicConditions = conditions.filter(c => c.name.trim() !== "");
      values.currentMedications = medications.filter(m => m.name.trim() !== "");

      // Get auth headers
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Submit the form
      const response = await axios.post(
        `${API_URL}/doctors/patients`,
        values,
        headers
      );

      if (response.data.success) {
        toast.success("Patient created successfully");
        router.push(`/doctor/patients/${response.data.data._id}`);
      } else {
        toast.error(response.data.message || "Failed to create patient");
      }
    } catch (err) {
      console.error("Error creating patient:", err);
      toast.error(err.response?.data?.message || "An error occurred while creating the patient");
    } finally {
      setSubmitting(false);
    }
  };

  // Add allergy field
  const addAllergy = () => {
    setAllergies([...allergies, { name: "", severity: "mild", reaction: "" }]);
  };

  // Remove allergy field
  const removeAllergy = (index) => {
    const newAllergies = [...allergies];
    newAllergies.splice(index, 1);
    setAllergies(newAllergies);
  };

  // Add condition field
  const addCondition = () => {
    setConditions([...conditions, { name: "", diagnosedDate: "", notes: "" }]);
  };

  // Remove condition field
  const removeCondition = (index) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  // Add medication field
  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", startDate: "" }]);
  };

  // Remove medication field
  const removeMedication = (index) => {
    const newMedications = [...medications];
    newMedications.splice(index, 1);
    setMedications(newMedications);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Link href="/doctor/patients">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Add New Patient</h1>
          <p className="text-muted-foreground">
            Create a new patient record with basic information
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Enter the patient's basic personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Enter the patient's basic medical information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unknown">Unknown</SelectItem>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Height"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <Select
                            onValueChange={(value) => form.setValue("height.unit", value)}
                            defaultValue={form.getValues("height.unit")}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="ft">ft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Weight"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <Select
                            onValueChange={(value) => form.setValue("weight.unit", value)}
                            defaultValue={form.getValues("weight.unit")}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lb">lb</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Allergies</Label>
                    <div className="space-y-2 mt-2">
                      {allergies.map((allergy, index) => (
                        <div key={index} className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              placeholder="Allergy name"
                              value={allergy.name}
                              onChange={(e) => {
                                const newAllergies = [...allergies];
                                newAllergies[index].name = e.target.value;
                                setAllergies(newAllergies);
                              }}
                            />
                          </div>
                          <div className="w-[120px]">
                            <Label className="text-xs">Severity</Label>
                            <Select
                              value={allergy.severity}
                              onValueChange={(value) => {
                                const newAllergies = [...allergies];
                                newAllergies[index].severity = value;
                                setAllergies(newAllergies);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Severity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Reaction</Label>
                            <Input
                              placeholder="Reaction"
                              value={allergy.reaction}
                              onChange={(e) => {
                                const newAllergies = [...allergies];
                                newAllergies[index].reaction = e.target.value;
                                setAllergies(newAllergies);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAllergy(index)}
                            disabled={allergies.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addAllergy}
                    >
                      Add Allergy
                    </Button>
                  </div>

                  <div>
                    <Label>Chronic Conditions</Label>
                    <div className="space-y-2 mt-2">
                      {conditions.map((condition, index) => (
                        <div key={index} className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Condition</Label>
                            <Input
                              placeholder="Condition name"
                              value={condition.name}
                              onChange={(e) => {
                                const newConditions = [...conditions];
                                newConditions[index].name = e.target.value;
                                setConditions(newConditions);
                              }}
                            />
                          </div>
                          <div className="w-[180px]">
                            <Label className="text-xs">Diagnosed Date</Label>
                            <Input
                              type="date"
                              value={condition.diagnosedDate}
                              onChange={(e) => {
                                const newConditions = [...conditions];
                                newConditions[index].diagnosedDate = e.target.value;
                                setConditions(newConditions);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Notes</Label>
                            <Input
                              placeholder="Notes"
                              value={condition.notes}
                              onChange={(e) => {
                                const newConditions = [...conditions];
                                newConditions[index].notes = e.target.value;
                                setConditions(newConditions);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCondition(index)}
                            disabled={conditions.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addCondition}
                    >
                      Add Condition
                    </Button>
                  </div>

                  <div>
                    <Label>Current Medications</Label>
                    <div className="space-y-2 mt-2">
                      {medications.map((medication, index) => (
                        <div key={index} className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Medication</Label>
                            <Input
                              placeholder="Medication name"
                              value={medication.name}
                              onChange={(e) => {
                                const newMedications = [...medications];
                                newMedications[index].name = e.target.value;
                                setMedications(newMedications);
                              }}
                            />
                          </div>
                          <div className="w-[120px]">
                            <Label className="text-xs">Dosage</Label>
                            <Input
                              placeholder="Dosage"
                              value={medication.dosage}
                              onChange={(e) => {
                                const newMedications = [...medications];
                                newMedications[index].dosage = e.target.value;
                                setMedications(newMedications);
                              }}
                            />
                          </div>
                          <div className="w-[150px]">
                            <Label className="text-xs">Frequency</Label>
                            <Input
                              placeholder="Frequency"
                              value={medication.frequency}
                              onChange={(e) => {
                                const newMedications = [...medications];
                                newMedications[index].frequency = e.target.value;
                                setMedications(newMedications);
                              }}
                            />
                          </div>
                          <div className="w-[180px]">
                            <Label className="text-xs">Start Date</Label>
                            <Input
                              type="date"
                              value={medication.startDate}
                              onChange={(e) => {
                                const newMedications = [...medications];
                                newMedications[index].startDate = e.target.value;
                                setMedications(newMedications);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeMedication(index)}
                            disabled={medications.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addMedication}
                    >
                      Add Medication
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Enter the patient's address and emergency contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="ZIP code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContact.relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input placeholder="Relationship" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Add any additional notes about the patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes here..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Link href="/doctor/patients">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Patient
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
