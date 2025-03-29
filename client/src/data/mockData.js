/**
 * Comprehensive mock data for MediLab application
 */

// Mock Users/Patients
export const users = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    dob: '1985-06-15',
    gender: 'Male',
    bloodType: 'O+',
    address: '123 Main Street, Anytown, CA 94123',
    medicalHistory: ['Hypertension', 'Seasonal allergies'],
    insurance: {
      provider: 'HealthGuard Insurance',
      policyNumber: 'HGI-5552468',
      expiryDate: '2024-12-31'
    }
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    dob: '1990-08-22',
    gender: 'Female',
    bloodType: 'A-',
    address: '456 Oak Avenue, Cityville, NY 10001',
    medicalHistory: ['Asthma', 'Migraine'],
    insurance: {
      provider: 'MediCover Plus',
      policyNumber: 'MCP-7751239',
      expiryDate: '2025-03-15'
    }
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+1 (555) 234-5678',
    dob: '1978-11-30',
    gender: 'Male',
    bloodType: 'B+',
    address: '789 Pine Road, Westfield, IL 60614',
    medicalHistory: ['Type 2 diabetes', 'High cholesterol'],
    insurance: {
      provider: 'National Health Group',
      policyNumber: 'NHG-3359867',
      expiryDate: '2024-08-22'
    }
  },
  {
    id: 4,
    name: 'Emily Wilson',
    email: 'e.wilson@example.com',
    phone: '+1 (555) 345-6789',
    dob: '1995-03-18',
    gender: 'Female',
    bloodType: 'AB+',
    address: '101 River Lane, Southtown, TX 75001',
    medicalHistory: [],
    insurance: {
      provider: 'HealthGuard Insurance',
      policyNumber: 'HGI-9984253',
      expiryDate: '2025-01-10'
    }
  },
  {
    id: 5,
    name: 'David Rodriguez',
    email: 'david.r@example.com',
    phone: '+1 (555) 456-7890',
    dob: '1982-07-09',
    gender: 'Male',
    bloodType: 'O-',
    address: '222 Maple Street, Eastville, FL 33101',
    medicalHistory: ['Arthritis'],
    insurance: {
      provider: 'CareFirst Medical',
      policyNumber: 'CFM-1122867',
      expiryDate: '2024-09-30'
    }
  }
];

// Mock Doctors
export const doctors = [
  {
    id: 1,
    name: 'Dr. Jennifer Williams',
    specialty: 'Cardiology',
    qualifications: 'MD, FACC',
    experience: '15 years',
    image: '/images/doctors/doctor1.jpg',
    bio: 'Dr. Williams is a board-certified cardiologist specializing in preventive cardiology and heart disease management. She completed her fellowship at Mayo Clinic and has published numerous research papers on cardiovascular health.',
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 127,
    availability: [
      { day: 'Monday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Tuesday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Thursday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] }
    ],
    locations: [1, 3]
  },
  {
    id: 2,
    name: 'Dr. Robert Chen',
    specialty: 'Neurology',
    qualifications: 'MD, PhD',
    experience: '12 years',
    image: '/images/doctors/doctor2.jpg',
    bio: 'Dr. Chen is a neurologist specializing in movement disorders and neurodegenerative diseases. He completed his medical training at Johns Hopkins University and holds a PhD in Neuroscience from Stanford University.',
    languages: ['English', 'Mandarin'],
    rating: 4.8,
    reviewCount: 93,
    availability: [
      { day: 'Monday', slots: ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Wednesday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Friday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM'] }
    ],
    locations: [2]
  },
  {
    id: 3,
    name: 'Dr. Maria Gonzalez',
    specialty: 'Pediatrics',
    qualifications: 'MD, FAAP',
    experience: '10 years',
    image: '/images/doctors/doctor3.jpg',
    bio: 'Dr. Gonzalez is a board-certified pediatrician focused on child development and preventive care. She completed her residency at Children\'s Hospital of Philadelphia and has a special interest in childhood nutrition and immunizations.',
    languages: ['English', 'Spanish', 'Portuguese'],
    rating: 4.9,
    reviewCount: 156,
    availability: [
      { day: 'Tuesday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Thursday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] }
    ],
    locations: [1, 4]
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgery',
    qualifications: 'MD, FAAOS',
    experience: '18 years',
    image: '/images/doctors/doctor4.jpg',
    bio: 'Dr. Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement. He served as the team physician for several professional sports teams and has performed over 3,000 orthopedic procedures.',
    languages: ['English'],
    rating: 4.7,
    reviewCount: 118,
    availability: [
      { day: 'Monday', slots: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'] },
      { day: 'Wednesday', slots: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Friday', slots: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'] }
    ],
    locations: [2, 5]
  },
  {
    id: 5,
    name: 'Dr. Sarah Patel',
    specialty: 'Dermatology',
    qualifications: 'MD, FAAD',
    experience: '9 years',
    image: '/images/doctors/doctor5.jpg',
    bio: 'Dr. Patel is a dermatologist specializing in medical, surgical, and cosmetic dermatology. She completed her residency at New York University and has expertise in treating skin cancer, acne, and various skin disorders.',
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: 4.8,
    reviewCount: 87,
    availability: [
      { day: 'Tuesday', slots: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'] },
      { day: 'Thursday', slots: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'] }
    ],
    locations: [3]
  },
  {
    id: 6,
    name: 'Dr. Michael Thompson',
    specialty: 'Internal Medicine',
    qualifications: 'MD',
    experience: '14 years',
    image: '/images/doctors/doctor6.jpg',
    bio: 'Dr. Thompson is a board-certified internist with expertise in preventive medicine and chronic disease management. He emphasizes a holistic approach to healthcare with a focus on lifestyle modifications and preventive care strategies.',
    languages: ['English', 'French'],
    rating: 4.6,
    reviewCount: 104,
    availability: [
      { day: 'Monday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'] },
      { day: 'Wednesday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] },
      { day: 'Friday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] }
    ],
    locations: [1, 5]
  }
];

// Mock Lab Tests
export const labTests = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC)',
    category: 'Blood',
    price: 40,
    discount: 10,
    turnaroundTime: '24 hours',
    description: 'Measures red and white blood cells, platelets, hemoglobin, and hematocrit. Used to evaluate overall health and detect a wide range of disorders.',
    preparations: 'No special preparation required. Fasting may be recommended.',
    sampleType: 'Blood sample',
    commonUses: [
      'Detect anemia or other blood disorders',
      'Evaluate overall health before surgery',
      'Screen for infection',
      'Monitor effects of medication on blood cells'
    ],
    recommendedFor: ['Annual check-ups', 'Unexplained fatigue', 'Suspected infection', 'Pre-surgical assessment']
  },
  {
    id: 2,
    name: 'Comprehensive Metabolic Panel',
    category: 'Blood',
    price: 60,
    discount: 0,
    turnaroundTime: '24 hours',
    description: 'Measures glucose, electrolyte and fluid balance, kidney function, and liver function. Provides overview of body\'s chemical balance and metabolism.',
    preparations: 'Fasting for 8-12 hours before the test.',
    sampleType: 'Blood sample',
    commonUses: [
      'Evaluate liver and kidney function',
      'Monitor chronic conditions like diabetes',
      'Check electrolyte and fluid balance',
      'Screen for diabetes and prediabetes'
    ],
    recommendedFor: ['Annual check-ups', 'Monitoring chronic diseases', 'Evaluating medication effects']
  },
  {
    id: 3,
    name: 'Lipid Panel',
    category: 'Blood',
    price: 45,
    discount: 15,
    turnaroundTime: '24 hours',
    description: 'Measures cholesterol levels (total cholesterol, HDL, LDL) and triglycerides to assess risk of heart disease.',
    preparations: 'Fasting for 9-12 hours before the test.',
    sampleType: 'Blood sample',
    commonUses: [
      'Screen for risk of heart disease or stroke',
      'Monitor effectiveness of cholesterol-lowering medications',
      'Assess cardiovascular health'
    ],
    recommendedFor: ['Adults over 40', 'Family history of heart disease', 'Hypertension patients', 'Obesity']
  },
  {
    id: 4,
    name: 'Hemoglobin A1C',
    category: 'Blood',
    price: 35,
    discount: 0,
    turnaroundTime: '24 hours',
    description: 'Measures average blood glucose levels over the past 2-3 months. Used to diagnose and monitor diabetes.',
    preparations: 'No special preparation required.',
    sampleType: 'Blood sample',
    commonUses: [
      'Diagnose diabetes and prediabetes',
      'Monitor long-term blood sugar control in diabetics'
    ],
    recommendedFor: ['Diabetic patients', 'Individuals with risk factors for diabetes']
  },
  {
    id: 5,
    name: 'Thyroid Function Panel',
    category: 'Blood',
    price: 70,
    discount: 5,
    turnaroundTime: '48 hours',
    description: 'Measures thyroid hormones (TSH, T3, T4) to evaluate thyroid function. Used to diagnose hypothyroidism, hyperthyroidism, and other thyroid disorders.',
    preparations: 'No special preparation required.',
    sampleType: 'Blood sample',
    commonUses: [
      'Diagnose thyroid disorders',
      'Monitor effectiveness of thyroid medication',
      'Screen for thyroid abnormalities during pregnancy'
    ],
    recommendedFor: ['Unexplained weight changes', 'Fatigue', 'Irregular heartbeat', 'Women over 60']
  },
  {
    id: 6,
    name: 'Urinalysis',
    category: 'Urine',
    price: 25,
    discount: 0,
    turnaroundTime: '24 hours',
    description: 'Evaluates physical and chemical properties of urine. Screens for urinary tract infections, kidney disease, and other conditions.',
    preparations: 'Clean-catch midstream urine sample recommended.',
    sampleType: 'Urine sample',
    commonUses: [
      'Diagnose urinary tract infections',
      'Screen for kidney disease',
      'Monitor diabetes',
      'Detect pregnancy complications'
    ],
    recommendedFor: ['Suspected UTI', 'Annual check-ups', 'Pregnant women', 'Kidney disease monitoring']
  },
  {
    id: 7,
    name: 'Liver Function Test',
    category: 'Blood',
    price: 55,
    discount: 0,
    turnaroundTime: '24 hours',
    description: 'Measures enzymes and proteins produced by the liver. Used to assess liver function, damage, and disease.',
    preparations: 'Fasting may be required.',
    sampleType: 'Blood sample',
    commonUses: [
      'Detect liver damage or disease',
      'Monitor liver function during medication use',
      'Evaluate alcohol-related liver damage'
    ],
    recommendedFor: ['Alcohol users', 'Those on certain medications', 'Suspected liver disease']
  },
  {
    id: 8,
    name: 'Chest X-Ray',
    category: 'Imaging',
    price: 120,
    discount: 0,
    turnaroundTime: '1 hour',
    description: 'Non-invasive imaging test that produces images of the chest, lungs, heart, blood vessels, and bones of the spine and chest.',
    preparations: 'Wear comfortable clothing. Remove jewelry and metallic items.',
    sampleType: 'Radiological imaging',
    commonUses: [
      'Detect lung diseases like pneumonia',
      'Identify broken ribs or other chest injuries',
      'Screen for lung cancer',
      'Evaluate heart health'
    ],
    recommendedFor: ['Persistent cough', 'Chest pain', 'Shortness of breath', 'Injury to the chest']
  },
  {
    id: 9,
    name: 'Ultrasound Abdomen',
    category: 'Imaging',
    price: 180,
    discount: 10,
    turnaroundTime: '1 hour',
    description: 'Uses sound waves to produce images of structures within the abdomen. Evaluates organs like liver, gallbladder, pancreas, kidneys, and more.',
    preparations: 'Fasting for 8-12 hours before the test. Full bladder may be required.',
    sampleType: 'Radiological imaging',
    commonUses: [
      'Detect gallstones',
      'Evaluate liver, kidney, or pancreas',
      'Identify causes of abdominal pain',
      'Monitor pregnancy development'
    ],
    recommendedFor: ['Abdominal pain', 'Abnormal lab results', 'Follow-up on abnormalities']
  },
  {
    id: 10,
    name: 'Echocardiogram',
    category: 'Cardiac',
    price: 220,
    discount: 0,
    turnaroundTime: '1 hour',
    description: 'Ultrasound of the heart that checks how your heart muscles and valves are functioning. It can spot blood clots and fluid around the heart.',
    preparations: 'No special preparation required.',
    sampleType: 'Radiological imaging',
    commonUses: [
      'Assess heart function and structure',
      'Detect heart disease',
      'Evaluate heart murmurs',
      'Monitor heart valve function'
    ],
    recommendedFor: ['Heart disease symptoms', 'Abnormal heart sounds', 'Heart attack follow-up']
  },
  {
    id: 11,
    name: 'COVID-19 PCR Test',
    category: 'Infectious Disease',
    price: 90,
    discount: 20,
    turnaroundTime: '24-48 hours',
    description: 'Detects genetic material specific to the SARS-CoV-2 virus. The most accurate test for diagnosing active COVID-19 infection.',
    preparations: 'No special preparation required.',
    sampleType: 'Nasopharyngeal swab',
    commonUses: [
      'Diagnose active COVID-19 infection',
      'Required for travel to certain countries',
      'Workplace or school screening'
    ],
    recommendedFor: ['COVID-19 symptoms', 'Exposure to confirmed case', 'Pre-travel requirements']
  },
  {
    id: 12,
    name: 'Food Allergy Panel',
    category: 'Allergy',
    price: 160,
    discount: 10,
    turnaroundTime: '3-5 days',
    description: 'Tests for IgE antibodies to common food allergens such as dairy, nuts, fish, wheat, soy, and more.',
    preparations: 'No special preparation required. Continue regular diet.',
    sampleType: 'Blood sample',
    commonUses: [
      'Identify food allergies',
      'Determine causes of reactions like hives, digestive issues',
      'Rule out food allergies'
    ],
    recommendedFor: ['Unexplained allergic reactions', 'Suspected food allergies', 'Digestive issues after eating']
  },
  {
    id: 13,
    name: 'Vitamin D, 25-Hydroxy',
    category: 'Blood',
    price: 65,
    discount: 0,
    turnaroundTime: '24-48 hours',
    description: 'Measures the level of vitamin D in the blood, which is important for bone health, immune function, and inflammation reduction.',
    preparations: 'No special preparation required.',
    sampleType: 'Blood sample',
    commonUses: [
      'Assess vitamin D status',
      'Diagnose vitamin D deficiency',
      'Monitor vitamin D supplementation'
    ],
    recommendedFor: ['Bone conditions like osteoporosis', 'Limited sun exposure', 'Malabsorption conditions']
  },
  {
    id: 14,
    name: 'Pap Smear',
    category: 'Women\'s Health',
    price: 85,
    discount: 10,
    turnaroundTime: '3-5 days',
    description: 'Screens for cervical cancer by detecting potentially precancerous and cancerous cells on the cervix.',
    preparations: 'Avoid sexual intercourse, douching, or using vaginal products for 24-48 hours before the test.',
    sampleType: 'Cervical cell sample',
    commonUses: [
      'Screen for cervical cancer',
      'Detect HPV infection',
      'Identify abnormal cervical cells'
    ],
    recommendedFor: ['Women ages 21-65', 'Routine gynecological care']
  },
  {
    id: 15,
    name: 'PSA (Prostate-Specific Antigen)',
    category: 'Men\'s Health',
    price: 70,
    discount: 5,
    turnaroundTime: '24 hours',
    description: 'Blood test that measures levels of prostate-specific antigen. Used to screen for prostate cancer.',
    preparations: 'Avoid ejaculation for 24 hours before the test.',
    sampleType: 'Blood sample',
    commonUses: [
      'Screen for prostate cancer',
      'Monitor prostate cancer treatment',
      'Check for prostate cancer recurrence'
    ],
    recommendedFor: ['Men over 50', 'Men with family history of prostate cancer', 'Monitoring existing prostate conditions']
  }
];

// Mock Locations
export const locations = [
  {
    id: 1,
    name: 'Main Medical Center - Downtown',
    address: '123 Health Avenue, Downtown, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'downtown@medilab.com',
    hours: 'Mon-Fri: 7:00 AM - 8:00 PM, Sat: 8:00 AM - 2:00 PM, Sun: Closed',
    services: ['Lab Tests', 'Doctor Consultations', 'Imaging', 'Vaccinations'],
    coordinates: {
      lat: 40.7128,
      lng: -74.0060
    },
    image: '/images/locations/downtown.jpg',
    parking: 'Limited street parking available. Paid parking garage at 130 Health Avenue.',
    publicTransport: 'Bus routes 10, 12, 15 stop nearby. Subway station 2 blocks away.'
  },
  {
    id: 2,
    name: 'Westside Health Clinic',
    address: '456 Medical Drive, Westside, NY 10023',
    phone: '+1 (555) 234-5678',
    email: 'westside@medilab.com',
    hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat-Sun: 9:00 AM - 1:00 PM',
    services: ['Lab Tests', 'Pediatrics', 'Women\'s Health', 'Primary Care'],
    coordinates: {
      lat: 40.7736,
      lng: -73.9566
    },
    image: '/images/locations/westside.jpg',
    parking: 'Free parking available for patients.',
    publicTransport: 'Bus routes 22, 23 stop outside. Westside station 5 blocks away.'
  },
  {
    id: 3,
    name: 'Northridge Medical Lab',
    address: '789 Science Blvd, Northridge, NY 11101',
    phone: '+1 (555) 345-6789',
    email: 'northridge@medilab.com',
    hours: 'Mon-Fri: 7:00 AM - 7:00 PM, Sat: 8:00 AM - 3:00 PM, Sun: Closed',
    services: ['Lab Tests', 'Blood Work', 'Imaging', 'EKG'],
    coordinates: {
      lat: 40.7484,
      lng: -73.9857
    },
    image: '/images/locations/northridge.jpg',
    parking: 'Free parking garage available.',
    publicTransport: 'Bus routes 31, 32 stop nearby. Subway lines A, B stop 3 blocks away.'
  },
  {
    id: 4,
    name: 'Eastpark Healthcare Facility',
    address: '101 Wellness Road, Eastpark, NY 10029',
    phone: '+1 (555) 456-7890',
    email: 'eastpark@medilab.com',
    hours: 'Mon-Thu: 8:00 AM - 8:00 PM, Fri: 8:00 AM - 6:00 PM, Sat-Sun: 9:00 AM - 2:00 PM',
    services: ['Lab Tests', 'Family Medicine', 'Dermatology', 'Nutrition Counseling'],
    coordinates: {
      lat: 40.7829,
      lng: -73.9654
    },
    image: '/images/locations/eastpark.jpg',
    parking: 'Limited free parking. Additional paid parking available nearby.',
    publicTransport: 'Bus routes 44, 45, 47 stop outside. Eastpark station 1 block away.'
  },
  {
    id: 5,
    name: 'Southpoint Diagnostic Center',
    address: '222 Health Street, Southpoint, NY 10002',
    phone: '+1 (555) 567-8901',
    email: 'southpoint@medilab.com',
    hours: 'Mon-Fri: 7:00 AM - 6:00 PM, Sat: 8:00 AM - 12:00 PM, Sun: Closed',
    services: ['Advanced Imaging', 'Specialized Lab Tests', 'Cardiology', 'Neurology'],
    coordinates: {
      lat: 40.7061,
      lng: -74.0108
    },
    image: '/images/locations/southpoint.jpg',
    parking: 'Free parking for patients with validation.',
    publicTransport: 'Bus routes 50, 51 stop nearby. Southpoint station 4 blocks away.'
  }
];

// Mock Appointments
export const appointments = [
  {
    id: 1,
    userId: 1,
    doctorId: 3,
    type: 'Doctor Consultation',
    date: '2023-11-15',
    time: '10:00 AM',
    status: 'Completed',
    notes: 'Annual checkup. Patient reported occasional headaches. Recommended blood tests.',
    locationId: 1
  },
  {
    id: 2,
    userId: 2,
    doctorId: null,
    testId: 1,
    type: 'Lab Test',
    date: '2023-11-10',
    time: '8:30 AM',
    status: 'Completed',
    notes: 'Complete Blood Count test completed. Results uploaded to patient portal.',
    locationId: 3
  },
  {
    id: 3,
    userId: 3,
    doctorId: 4,
    type: 'Doctor Consultation',
    date: '2023-11-18',
    time: '3:00 PM',
    status: 'Scheduled',
    notes: 'Follow-up for knee pain. MRI results to be reviewed.',
    locationId: 2
  },
  {
    id: 4,
    userId: 1,
    doctorId: null,
    testId: 8,
    type: 'Lab Test',
    date: '2023-11-20',
    time: '11:30 AM',
    status: 'Scheduled',
    notes: 'Chest X-ray as recommended by Dr. Williams.',
    locationId: 5
  },
  {
    id: 5,
    userId: 4,
    doctorId: 5,
    type: 'Doctor Consultation',
    date: '2023-11-22',
    time: '2:30 PM',
    status: 'Scheduled',
    notes: 'Initial consultation for skin rash.',
    locationId: 3
  }
];

// Mock Test Results
export const testResults = [
  {
    id: 1,
    userId: 1,
    testId: 1,
    date: '2023-10-20',
    results: {
      components: [
        { name: 'Red Blood Cell Count', value: '5.1', unit: 'million/µL', range: '4.5-5.9', status: 'Normal' },
        { name: 'White Blood Cell Count', value: '8.2', unit: 'thousand/µL', range: '4.5-11.0', status: 'Normal' },
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'Normal' },
        { name: 'Hematocrit', value: '42', unit: '%', range: '41-50', status: 'Normal' },
        { name: 'Platelet Count', value: '250', unit: 'thousand/µL', range: '150-450', status: 'Normal' }
      ],
      summary: 'All values within normal ranges. No abnormalities detected.',
      doctor: 'Dr. Michael Thompson',
      verified: true
    },
    pdf: '/results/cbc_results_123.pdf'
  },
  {
    id: 2,
    userId: 2,
    testId: 3,
    date: '2023-10-15',
    results: {
      components: [
        { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', range: '<200', status: 'High' },
        { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', range: '>40', status: 'Normal' },
        { name: 'LDL Cholesterol', value: '140', unit: 'mg/dL', range: '<100', status: 'High' },
        { name: 'Triglycerides', value: '150', unit: 'mg/dL', range: '<150', status: 'Normal' }
      ],
      summary: 'Elevated total and LDL cholesterol. Recommend dietary changes and follow-up in 3 months.',
      doctor: 'Dr. Jennifer Williams',
      verified: true
    },
    pdf: '/results/lipid_results_456.pdf'
  },
  {
    id: 3,
    userId: 3,
    testId: 5,
    date: '2023-10-25',
    results: {
      components: [
        { name: 'TSH', value: '4.8', unit: 'mIU/L', range: '0.4-4.0', status: 'High' },
        { name: 'Free T4', value: '0.9', unit: 'ng/dL', range: '0.8-1.8', status: 'Normal' },
        { name: 'Free T3', value: '3.0', unit: 'pg/mL', range: '2.3-4.2', status: 'Normal' }
      ],
      summary: 'Elevated TSH with normal T4 and T3 suggests subclinical hypothyroidism. Recommend follow-up with endocrinologist.',
      doctor: 'Dr. Robert Chen',
      verified: true
    },
    pdf: '/results/thyroid_results_789.pdf'
  }
];

// Mock Reviews
export const reviews = [
  {
    id: 1,
    userId: 1,
    doctorId: 3,
    rating: 5,
    date: '2023-10-18',
    comment: 'Dr. Gonzalez was wonderful with my child. She took the time to explain everything clearly and made my son feel comfortable. Highly recommend!'
  },
  {
    id: 2,
    userId: 2,
    doctorId: 4,
    rating: 4,
    date: '2023-10-20',
    comment: 'Dr. Wilson is very knowledgeable and professional. The only downside was the wait time, but the care received was excellent.'
  },
  {
    id: 3,
    userId: 3,
    doctorId: 1,
    rating: 5,
    date: '2023-10-22',
    comment: 'Dr. Williams detected an issue with my heart that other doctors missed. Her attention to detail potentially saved my life. Eternally grateful.'
  },
  {
    id: 4,
    userId: 4,
    testId: 1,
    serviceType: 'Lab Test',
    locationId: 3,
    rating: 5,
    date: '2023-10-19',
    comment: 'The blood draw was quick and painless. Got my results back earlier than expected. Great service!'
  },
  {
    id: 5,
    userId: 5,
    testId: 8,
    serviceType: 'Lab Test',
    locationId: 5,
    rating: 4,
    date: '2023-10-21',
    comment: 'The X-ray technician was professional and explained the process well. Facility was clean and modern.'
  }
];

// Combined data export for easy importing
export const mockData = {
  users,
  doctors,
  labTests,
  locations,
  appointments,
  testResults,
  reviews
};

export default mockData;
