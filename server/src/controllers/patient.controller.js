import Patient from '../models/patient.model.js';
import { User } from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import Prescription from '../models/prescription.model.js';
import MedicalRecord from '../models/medicalRecord.model.js';
import { LabOrder } from '../models/labTest.model.js';

// Get patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      patient: {
        ...patient.toObject(),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient profile'
    });
  }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      address,
      city,
      state,
      zipCode,
      country
    } = req.body;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Update patient information
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (height) patient.height = height;
    if (weight) patient.weight = weight;
    
    // Update address
    if (address || city || state || zipCode || country) {
      patient.address = {
        ...patient.address,
        street: address || patient.address.street,
        city: city || patient.address.city,
        state: state || patient.address.state,
        zipCode: zipCode || patient.address.zipCode,
        country: country || patient.address.country
      };
    }

    await patient.save();

    // Update user's profile completion status if this is first update
    const user = await User.findById(userId);
    if (user && !user.isProfileComplete) {
      user.isProfileComplete = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient profile'
    });
  }
};

// Get patient medical history
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get all medical records, appointments, prescriptions
    const medicalRecords = await MedicalRecord.find({ patient: userId })
      .sort({ recordDate: -1 });
    
    const appointments = await Appointment.find({ patient: userId })
      .sort({ appointmentDate: -1 })
      .populate('doctor', 'firstName lastName specializations');
    
    const prescriptions = await Prescription.find({ patient: userId })
      .sort({ prescriptionDate: -1 })
      .populate('doctor', 'firstName lastName specializations');
    
    const labOrders = await LabOrder.find({ patient: userId })
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      medicalHistory: {
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        currentMedications: patient.currentMedications,
        familyHistory: patient.familyHistory,
        lifestyle: patient.lifestyle,
        records: {
          medicalRecords,
          appointments,
          prescriptions,
          labOrders
        }
      }
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical history'
    });
  }
};

// Update medical information
export const updateMedicalInformation = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      allergies,
      chronicConditions,
      currentMedications,
      familyHistory,
      lifestyle
    } = req.body;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Update medical information
    if (allergies) patient.allergies = allergies;
    if (chronicConditions) patient.chronicConditions = chronicConditions;
    if (currentMedications) patient.currentMedications = currentMedications;
    if (familyHistory) patient.familyHistory = familyHistory;
    
    if (lifestyle) {
      patient.lifestyle = {
        ...patient.lifestyle,
        ...lifestyle
      };
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Medical information updated successfully',
      medicalInfo: {
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        currentMedications: patient.currentMedications,
        familyHistory: patient.familyHistory,
        lifestyle: patient.lifestyle
      }
    });
  } catch (error) {
    console.error('Update medical information error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medical information'
    });
  }
};

// Get patient appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Build query
    const query = { patient: userId };
    if (status) {
      query.status = status;
    }

    // Get appointments
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .populate('doctor', 'firstName lastName specializations')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// Get patient prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Build query
    const query = { patient: userId };
    if (status) {
      query.status = status;
    }

    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .sort({ prescriptionDate: -1 })
      .populate('doctor', 'firstName lastName specializations')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      prescriptions
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions'
    });
  }
};

// Add allergies
export const addAllergies = async (req, res) => {
  try {
    const userId = req.user._id;
    const { allergies } = req.body;

    if (!allergies || !Array.isArray(allergies)) {
      return res.status(400).json({
        success: false,
        message: 'Allergies should be provided as an array'
      });
    }

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Add allergies, avoiding duplicates
    const currentAllergies = new Set(patient.allergies);
    allergies.forEach(allergy => currentAllergies.add(allergy));
    
    patient.allergies = [...currentAllergies];
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Allergies added successfully',
      allergies: patient.allergies
    });
  } catch (error) {
    console.error('Add allergies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding allergies'
    });
  }
};

// Remove allergies
export const removeAllergies = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Remove allergy
    patient.allergies = patient.allergies.filter(allergy => allergy !== id);
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Allergy removed successfully',
      allergies: patient.allergies
    });
  } catch (error) {
    console.error('Remove allergies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing allergy'
    });
  }
};

// Update emergency contact
export const updateEmergencyContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, relationship, phone } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, relationship, and phone are required'
      });
    }

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Update emergency contact
    patient.emergencyContact = {
      name,
      relationship,
      phone
    };
    
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      emergencyContact: patient.emergencyContact
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating emergency contact'
    });
  }
};

// Get patient lab results
export const getPatientLabResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Build query
    const query = { patient: userId };
    if (status) {
      query.status = status;
    }

    // Get lab orders
    const labOrders = await LabOrder.find(query)
      .sort({ orderDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await LabOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      count: labOrders.length,
      total,
      labOrders
    });
  } catch (error) {
    console.error('Get lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab results'
    });
  }
};

// Update insurance info
export const updateInsuranceInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { provider, policyNumber, expiryDate, coverageDetails } = req.body;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Update insurance info
    patient.insuranceInfo = {
      provider: provider || patient.insuranceInfo?.provider,
      policyNumber: policyNumber || patient.insuranceInfo?.policyNumber,
      expiryDate: expiryDate || patient.insuranceInfo?.expiryDate,
      coverageDetails: coverageDetails || patient.insuranceInfo?.coverageDetails
    };
    
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Insurance information updated successfully',
      insuranceInfo: patient.insuranceInfo
    });
  } catch (error) {
    console.error('Update insurance info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating insurance information'
    });
  }
};

// Get BMI
export const getBMI = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    if (!patient.height || !patient.weight) {
      return res.status(400).json({
        success: false,
        message: 'Height and weight are required to calculate BMI'
      });
    }

    const bmi = patient.calculateBMI();
    
    // Determine BMI category
    let category;
    if (bmi < 18.5) {
      category = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
    } else {
      category = 'Obesity';
    }

    res.status(200).json({
      success: true,
      bmi,
      category,
      height: patient.height, // in cm
      weight: patient.weight  // in kg
    });
  } catch (error) {
    console.error('Get BMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating BMI'
    });
  }
};

// Get age
export const getAge = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    if (!patient.dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required to calculate age'
      });
    }

    const age = patient.getAge();

    res.status(200).json({
      success: true,
      age,
      dateOfBirth: patient.dateOfBirth
    });
  } catch (error) {
    console.error('Get age error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating age'
    });
  }
};

// Get patient by ID (for doctors and admins)
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find patient
    const patient = await Patient.findOne({ user: id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get user info
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      patient: {
        ...patient.toObject(),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient'
    });
  }
};
