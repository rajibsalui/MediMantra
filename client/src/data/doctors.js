// Enhanced doctor data with complete fields for all doctors
export const doctorsData = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    experience: "15+ years",
    hospital: "Downtown Medical Center",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Harvard Medical School",
    bio: "Dr. Johnson is a board-certified cardiologist specializing in preventive cardiology and heart disease management with over 15 years of experience helping patients improve their cardiovascular health.",
    schedule: "Mon, Tue, Wed, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.9,
    reviews: 124,
    address: "123 Medical Plaza Dr, Suite 300, Metropolis, CA 90001",
    website: "heartcaremetropolis.com",
    services: [
      "Cardiovascular Risk Assessment",
      "Echocardiography",
      "ECG/EKG Testing",
      "Stress Testing",
      "Cardiac Rehabilitation",
      "Preventive Cardiology"
    ],
    languages: ["English", "Spanish", "French"],
    certifications: [
      "American Board of Internal Medicine",
      "American College of Cardiology"
    ],
    education: [
      { degree: "MD in Cardiovascular Medicine", institution: "Harvard Medical School", year: "2005-2009" },
      { degree: "Residency in Internal Medicine", institution: "Massachusetts General Hospital", year: "2009-2012" },
      { degree: "Fellowship in Cardiology", institution: "Stanford Medical Center", year: "2012-2015" }
    ],
    insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Cigna"],
    reviews: [
      { id: "r1", name: "James Wilson", rating: 5, comment: "Dr. Johnson is extremely thorough and takes time to explain everything." },
      { id: "r2", name: "Maria Garcia", rating: 5, comment: "Amazing doctor! Dr. Johnson discovered a heart condition other doctors missed for years." },
      { id: "r3", name: "Robert Chen", rating: 4, comment: "Very knowledgeable and professional. Sometimes the wait time can be long." },
      { id: "r4", name: "Sarah Thompson", rating: 5, comment: "Dr. Johnson has been my cardiologist for 5+ years. Always compassionate and up-to-date." }
    ],
    nextAvailable: "Today",
    price: 150,
  },
  {
    id: "2",
    name: "Dr. James Chen",
    specialty: "Dermatologist",
    experience: "10+ years",
    hospital: "Westside Skin Clinic",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Johns Hopkins School of Medicine",
    bio: "Dr. Chen specializes in medical dermatology, cosmetic procedures, and skin cancer treatment with a focus on minimally invasive techniques and personalized treatment plans.",
    schedule: "Mon, Wed, Thu, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.8,
    reviews: 97,
    address: "456 Dermatology Way, Suite 200, Westside, CA 90210",
    website: "westsidedermatology.com",
    services: ["Medical Dermatology", "Cosmetic Procedures", "Skin Cancer Treatment", "Acne Management"],
    languages: ["English", "Mandarin", "Cantonese"],
    certifications: ["American Board of Dermatology"],
    education: [
      { degree: "MD", institution: "Johns Hopkins School of Medicine", year: "2010-2014" },
      { degree: "Residency in Dermatology", institution: "University of California San Francisco", year: "2014-2017" },
      { degree: "Fellowship in Cosmetic Dermatology", institution: "New York University", year: "2017-2018" }
    ],
    insurance: ["Blue Cross Blue Shield", "Cigna", "Aetna"],
    reviews: [
      { id: "r1", name: "Lisa Johnson", rating: 5, comment: "Dr. Chen completely cleared my persistent acne when other treatments failed." },
      { id: "r2", name: "Michael Wong", rating: 5, comment: "Excellent bedside manner and very knowledgeable about the latest skin treatments." },
      { id: "r3", name: "Jennifer Smith", rating: 4, comment: "Professional and thorough. The wait time can be long, but worth it." }
    ],
    nextAvailable: "Tomorrow",
    price: 175,
  },
  // ...remaining doctors data
];
