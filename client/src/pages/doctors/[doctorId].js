import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import BookAppointment from "../../components/appointment/BookAppointment";
import DoctorProfile from "../../components/doctor/DoctorProfile";
import { useAuth } from "../../contexts/AuthContext";

export default function DoctorPage() {
  const router = useRouter();
  const { doctorId } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;

      try {
        const response = await fetch(`/api/doctors/${doctorId}`);
        const data = await response.json();

        if (data.success) {
          setDoctor(data.data);
        } else {
          toast.error(data.message || "Failed to fetch doctor details");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const handleBookAppointmentClick = () => {
    if (!isAuthenticated) {
      // Store the current URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", router.asPath);
      router.push("/login?redirect=true");
      return;
    }

    // Check if user is a patient
    if (user?.role !== "patient") {
      toast.error("Only patients can book appointments");
      return;
    }

    setActiveTab("book");
  };

  if (loading || !doctorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The doctor you're looking for doesn't exist or is not available.
          </p>
          <button
            onClick={() => router.push("/doctors")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;

  return (
    <>
      <Head>
        <title>
          {activeTab === "profile" 
            ? doctorName 
            : `Book Appointment with ${doctorName}`} | MediMantra
        </title>
      </Head>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {doctor.user.firstName} {doctor.user.lastName}
          </h1>
          <p className="text-xl text-muted-foreground mt-1">
            {doctor.specialties.join(", ")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
            <div className="mb-6 sticky top-20">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 text-left rounded-md ${
                    activeTab === "profile"
                      ? "bg-primary text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Doctor Profile
                </button>
                <button
                  onClick={handleBookAppointmentClick}
                  className={`px-4 py-2 text-left rounded-md ${
                    activeTab === "book"
                      ? "bg-primary text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            {activeTab === "profile" ? (
              <DoctorProfile doctor={doctor} onBookAppointment={handleBookAppointmentClick} />
            ) : (
              <BookAppointment doctorId={doctorId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
