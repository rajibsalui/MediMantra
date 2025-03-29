import Pharmacy from '../models/pharmacy.model.js';
import Prescription from '../models/prescription.model.js';
import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import Review from '../models/review.model.js';
import mongoose from 'mongoose';

// Create or update pharmacy profile
export const createUpdatePharmacyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      address,
      phone,
      licenseNumber,
      operatingHours,
      services,
      description
    } = req.body;

    // Check if user is a pharmacy staff
    if (req.user.role !== 'pharmacy' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy staff can create or update pharmacy profiles'
      });
    }

    // Find existing pharmacy profile
    let pharmacy = await Pharmacy.findOne({ user: userId });

    if (pharmacy) {
      // Update existing pharmacy
      pharmacy.name = name || pharmacy.name;
      pharmacy.address = address || pharmacy.address;
      pharmacy.phone = phone || pharmacy.phone;
      pharmacy.licenseNumber = licenseNumber || pharmacy.licenseNumber;
      pharmacy.operatingHours = operatingHours || pharmacy.operatingHours;
      pharmacy.services = services || pharmacy.services;
      pharmacy.description = description || pharmacy.description;
      pharmacy.updatedAt = new Date();
    } else {
      // Create new pharmacy
      pharmacy = new Pharmacy({
        user: userId,
        name,
        address,
        phone,
        licenseNumber,
        operatingHours,
        services,
        description
      });
    }

    await pharmacy.save();

    res.status(200).json({
      success: true,
      message: 'Pharmacy profile updated successfully',
      pharmacy
    });
  } catch (error) {
    console.error('Create/update pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pharmacy profile',
      error: error.message
    });
  }
};

// Get pharmacy profile
export const getPharmacyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = id || req.user._id;

    // Find pharmacy
    const pharmacy = await Pharmacy.findOne({ user: userId });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    res.status(200).json({
      success: true,
      pharmacy
    });
  } catch (error) {
    console.error('Get pharmacy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy profile',
      error: error.message
    });
  }
};

// Get pharmacy by ID
export const getPharmacyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find pharmacy
    const pharmacy = await Pharmacy.findById(id)
      .populate('user', 'firstName lastName email phone avatar');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.status(200).json({
      success: true,
      pharmacy
    });
  } catch (error) {
    console.error('Get pharmacy by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy',
      error: error.message
    });
  }
};

// Update pharmacy details
export const updatePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      phone,
      licenseNumber,
      operatingHours,
      services,
      description,
      specialties,
      acceptsInsurance,
      insuranceProviders,
      deliveryOptions
    } = req.body;

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update pharmacy details'
      });
    }

    // If pharmacy user, check if they're updating their own pharmacy
    if (req.user.role === 'pharmacy') {
      const pharmacyExists = await Pharmacy.findOne({ user: req.user._id });
      if (!pharmacyExists || pharmacyExists._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own pharmacy'
        });
      }
    }

    // Find pharmacy
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    // Update fields if provided
    if (name) pharmacy.name = name;
    if (address) pharmacy.address = address;
    if (phone) pharmacy.phone = phone;
    if (licenseNumber) pharmacy.licenseNumber = licenseNumber;
    if (operatingHours) pharmacy.operatingHours = operatingHours;
    if (services) pharmacy.services = services;
    if (description) pharmacy.description = description;
    if (specialties) pharmacy.specialties = specialties;
    if (acceptsInsurance !== undefined) pharmacy.acceptsInsurance = acceptsInsurance;
    if (insuranceProviders) pharmacy.insuranceProviders = insuranceProviders;
    if (deliveryOptions) pharmacy.deliveryOptions = deliveryOptions;

    pharmacy.updatedAt = new Date();

    await pharmacy.save();

    res.status(200).json({
      success: true,
      message: 'Pharmacy updated successfully',
      pharmacy
    });
  } catch (error) {
    console.error('Update pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pharmacy',
      error: error.message
    });
  }
};

// Get all pharmacies
export const getAllPharmacies = async (req, res) => {
  try {
    const { limit = 10, skip = 0, search, location } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { 'address.city': { $regex: searchRegex } }
      ];
    }

    if (location) {
      query['address.city'] = new RegExp(location, 'i');
    }

    // Get pharmacies
    const pharmacies = await Pharmacy.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Pharmacy.countDocuments(query);

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      total,
      pharmacies
    });
  } catch (error) {
    console.error('Get all pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacies',
      error: error.message
    });
  }
};

// List all pharmacies (with pagination and filtering)
export const listPharmacies = async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      sort = 'name', 
      order = 'asc',
      verified = true,
      active = true
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    
    if (verified === 'true') {
      query.isVerified = true;
    } else if (verified === 'false') {
      query.isVerified = false;
    }
    
    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }

    // Get pharmacies
    const pharmacies = await Pharmacy.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Pharmacy.countDocuments(query);

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      pharmacies
    });
  } catch (error) {
    console.error('List pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacies',
      error: error.message
    });
  }
};

// Search pharmacies
export const searchPharmacies = async (req, res) => {
  try {
    const { 
      query, 
      location, 
      service, 
      insurance,
      limit = 10, 
      page = 1 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    const searchCriteria = { isActive: true, isVerified: true };
    
    if (query) {
      const searchRegex = new RegExp(query, 'i');
      searchCriteria.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { 'services.name': { $regex: searchRegex } }
      ];
    }
    
    if (location) {
      searchCriteria['address.city'] = new RegExp(location, 'i');
    }
    
    if (service) {
      searchCriteria['services'] = { 
        $elemMatch: { name: new RegExp(service, 'i') } 
      };
    }
    
    if (insurance) {
      searchCriteria.acceptsInsurance = true;
      searchCriteria.insuranceProviders = { 
        $elemMatch: { $regex: new RegExp(insurance, 'i') } 
      };
    }

    // Get pharmacies
    const pharmacies = await Pharmacy.find(searchCriteria)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Pharmacy.countDocuments(searchCriteria);

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      pharmacies
    });
  } catch (error) {
    console.error('Search pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching pharmacies',
      error: error.message
    });
  }
};

// Get nearby pharmacies
export const getNearbyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10, limit = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Convert distance to radians (MongoDB uses radians for geospatial queries)
    // 6371 is the Earth's radius in kilometers
    const distanceInRadians = parseInt(maxDistance) / 6371;
    
    // Get nearby pharmacies
    const nearbyPharmacies = await Pharmacy.find({
      isActive: true,
      isVerified: true,
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            distanceInRadians
          ]
        }
      }
    })
    .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: nearbyPharmacies.length,
      pharmacies: nearbyPharmacies
    });
  } catch (error) {
    console.error('Get nearby pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby pharmacies',
      error: error.message
    });
  }
};

// Get pharmacies by service
export const getPharmacyByService = async (req, res) => {
  try {
    const { service } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find pharmacies offering specific service
    const pharmacies = await Pharmacy.find({
      isActive: true,
      isVerified: true,
      'services.name': new RegExp(service, 'i')
    })
    .sort({ name: 1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Pharmacy.countDocuments({
      isActive: true,
      isVerified: true,
      'services.name': new RegExp(service, 'i')
    });
    
    res.status(200).json({
      success: true,
      count: pharmacies.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      service,
      pharmacies
    });
  } catch (error) {
    console.error('Get pharmacies by service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacies by service',
      error: error.message
    });
  }
};

// Update pharmacy status (admin only)
export const updatePharmacyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update pharmacy status'
      });
    }
    
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive status is required'
      });
    }
    
    // Find pharmacy
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    // Update status
    pharmacy.isActive = isActive;
    pharmacy.statusUpdateReason = reason;
    pharmacy.statusUpdatedAt = new Date();
    pharmacy.statusUpdatedBy = req.user._id;
    
    await pharmacy.save();
    
    // Notify pharmacy owner
    if (pharmacy.user) {
      await Notification.createNotification({
        recipient: pharmacy.user,
        sender: req.user._id,
        type: 'pharmacy_status_update',
        title: `Pharmacy ${isActive ? 'Activated' : 'Deactivated'}`,
        message: `Your pharmacy has been ${isActive ? 'activated' : 'deactivated'}${reason ? `: ${reason}` : ''}`,
        relatedDocument: {
          model: 'Pharmacy',
          id: pharmacy._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Pharmacy ${isActive ? 'activated' : 'deactivated'} successfully`,
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        isActive: pharmacy.isActive
      }
    });
  } catch (error) {
    console.error('Update pharmacy status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pharmacy status',
      error: error.message
    });
  }
};

// Verify pharmacy (admin only)
export const verifyPharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, verificationNotes } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify pharmacies'
      });
    }
    
    if (isVerified === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isVerified status is required'
      });
    }
    
    // Find pharmacy
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    // Update verification status
    pharmacy.isVerified = isVerified;
    pharmacy.verificationNotes = verificationNotes;
    pharmacy.verifiedAt = isVerified ? new Date() : null;
    pharmacy.verifiedBy = isVerified ? req.user._id : null;
    
    await pharmacy.save();
    
    // Notify pharmacy owner
    if (pharmacy.user) {
      await Notification.createNotification({
        recipient: pharmacy.user,
        sender: req.user._id,
        type: 'pharmacy_verification',
        title: isVerified ? 'Pharmacy Verified' : 'Pharmacy Verification Failed',
        message: isVerified 
          ? 'Your pharmacy has been verified and is now listed on our platform.' 
          : `Your pharmacy verification was unsuccessful${verificationNotes ? `: ${verificationNotes}` : '.'}`,
        relatedDocument: {
          model: 'Pharmacy',
          id: pharmacy._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: isVerified ? 'Pharmacy verified successfully' : 'Pharmacy verification declined',
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        isVerified: pharmacy.isVerified
      }
    });
  } catch (error) {
    console.error('Verify pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying pharmacy',
      error: error.message
    });
  }
};

// Add pharmacy review
export const addPharmacyReview = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { rating, comment, anonymous = false } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5'
      });
    }
    
    // Find pharmacy
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    // Check if user has already reviewed this pharmacy
    const existingReview = await Review.findOne({
      reviewer: userId,
      pharmacy: pharmacyId,
      type: 'pharmacy'
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this pharmacy',
        reviewId: existingReview._id
      });
    }
    
    // Create new review
    const review = await Review.create({
      reviewer: userId,
      pharmacy: pharmacyId,
      rating,
      comment,
      isAnonymous: anonymous,
      type: 'pharmacy',
      status: 'published'
    });
    
    // Update pharmacy average rating
    const allReviews = await Review.find({ 
      pharmacy: pharmacyId, 
      type: 'pharmacy',
      status: 'published'
    });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    pharmacy.ratings = {
      average: averageRating,
      count: allReviews.length
    };
    
    await pharmacy.save();
    
    // Notify pharmacy owner
    if (pharmacy.user) {
      await Notification.createNotification({
        recipient: pharmacy.user,
        sender: userId,
        type: 'pharmacy_reviewed',
        title: 'New Pharmacy Review',
        message: `Your pharmacy has received a new ${rating}-star review`,
        relatedDocument: {
          model: 'Review',
          id: review._id
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Add pharmacy review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting pharmacy review',
      error: error.message
    });
  }
};

// Get pharmacy reviews
export const getPharmacyReviews = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { limit = 10, page = 1, sort = 'newest' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find pharmacy
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    // Determine sort order
    let sortQuery = {};
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortQuery = { rating: -1 };
    } else if (sort === 'lowest') {
      sortQuery = { rating: 1 };
    }
    
    // Get reviews
    const reviews = await Review.find({
      pharmacy: pharmacyId,
      type: 'pharmacy',
      status: 'published'
    })
    .populate('reviewer', 'firstName lastName avatar')
    .sort(sortQuery)
    .limit(parseInt(limit))
    .skip(skip);
    
    // Get total
    const total = await Review.countDocuments({
      pharmacy: pharmacyId,
      type: 'pharmacy',
      status: 'published'
    });
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $match: {
          pharmacy: mongoose.Types.ObjectId(pharmacyId),
          type: 'pharmacy',
          status: 'published'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      ratings: {
        average: pharmacy.ratings?.average || 0,
        count: pharmacy.ratings?.count || 0,
        distribution
      },
      reviews
    });
  } catch (error) {
    console.error('Get pharmacy reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy reviews',
      error: error.message
    });
  }
};

// Update pharmacy operating hours
export const updatePharmacyHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatingHours } = req.body;
    
    if (!operatingHours) {
      return res.status(400).json({
        success: false,
        message: 'Operating hours are required'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update pharmacy hours'
      });
    }
    
    // If pharmacy user, check if they're updating their own pharmacy
    if (req.user.role === 'pharmacy') {
      const pharmacyExists = await Pharmacy.findOne({ user: req.user._id });
      if (!pharmacyExists || pharmacyExists._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own pharmacy'
        });
      }
    }
    
    // Find pharmacy
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    // Update operating hours
    pharmacy.operatingHours = operatingHours;
    pharmacy.updatedAt = new Date();
    
    await pharmacy.save();
    
    res.status(200).json({
      success: true,
      message: 'Operating hours updated successfully',
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        operatingHours: pharmacy.operatingHours
      }
    });
  } catch (error) {
    console.error('Update pharmacy hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pharmacy hours',
      error: error.message
    });
  }
};

// Get pharmacies by specialty
export const getPharmacyBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find pharmacies with specific specialty
    const pharmacies = await Pharmacy.find({
      isActive: true,
      isVerified: true,
      specialties: { $in: [new RegExp(specialty, 'i')] }
    })
    .sort({ 'ratings.average': -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Pharmacy.countDocuments({
      isActive: true,
      isVerified: true,
      specialties: { $in: [new RegExp(specialty, 'i')] }
    });
    
    res.status(200).json({
      success: true,
      count: pharmacies.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      specialty,
      pharmacies
    });
  } catch (error) {
    console.error('Get pharmacies by specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacies by specialty',
      error: error.message
    });
  }
};

// Process prescription
export const processPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;

    // Check if user is pharmacy staff
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy staff can process prescriptions'
      });
    }

    // Find prescription
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if prescription can be processed
    if (prescription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot process prescription with status "${prescription.status}"`
      });
    }

    // Update prescription status
    if (status === 'dispensed') {
      prescription.status = 'dispensed';
      prescription.dispensingDetails = {
        dispensedBy: userId,
        dispensedAt: new Date(),
        pharmacy: userId,
        notes: notes || ''
      };
    } else if (status === 'pending') {
      prescription.pharmacyNotes = notes;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use "dispensed" or "pending"'
      });
    }

    await prescription.save();

    // If dispensed, notify the patient
    if (status === 'dispensed') {
      await Notification.createNotification({
        recipient: prescription.patient._id,
        sender: userId,
        type: 'prescription_dispensed',
        title: 'Prescription Dispensed',
        message: 'Your prescription has been dispensed by the pharmacy',
        relatedDocument: {
          model: 'Prescription',
          id: prescription._id
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Prescription ${status === 'dispensed' ? 'dispensed' : 'updated'} successfully`,
      prescription
    });
  } catch (error) {
    console.error('Process prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing prescription',
      error: error.message
    });
  }
};

// Get pending prescriptions for pharmacy
export const getPendingPrescriptions = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;

    // Check if user is pharmacy staff
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy staff can access pending prescriptions'
      });
    }

    // Get active prescriptions
    const prescriptions = await Prescription.find({ status: 'active' })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specializations')
      .sort({ prescriptionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Prescription.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      prescriptions
    });
  } catch (error) {
    console.error('Get pending prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending prescriptions',
      error: error.message
    });
  }
};

// Get dispensed prescriptions history
export const getDispensedPrescriptions = async (req, res) => {
  try {
    const { limit = 10, skip = 0, startDate, endDate } = req.query;
    const userId = req.user._id;

    // Check if user is pharmacy staff
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy staff can access dispensed prescriptions'
      });
    }

    // Build query
    const query = { 
      status: 'dispensed',
      'dispensingDetails.dispensedBy': userId 
    };

    // Add date range if provided
    if (startDate && endDate) {
      query['dispensingDetails.dispensedAt'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get dispensed prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specializations')
      .sort({ 'dispensingDetails.dispensedAt': -1 })
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
    console.error('Get dispensed prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dispensed prescriptions',
      error: error.message
    });
  }
};

// Get pharmacy statistics
export const getPharmacyStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is pharmacy staff
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy staff can access pharmacy statistics'
      });
    }

    // Get total dispensed prescriptions
    const totalDispensed = await Prescription.countDocuments({
      status: 'dispensed',
      'dispensingDetails.dispensedBy': userId
    });

    // Get dispensing trends by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dispensingTrends = await Prescription.aggregate([
      {
        $match: {
          status: 'dispensed',
          'dispensingDetails.dispensedBy': userId,
          'dispensingDetails.dispensedAt': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dispensingDetails.dispensedAt' },
            month: { $month: '$dispensingDetails.dispensedAt' },
            day: { $dayOfMonth: '$dispensingDetails.dispensedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get prescriptions by doctor
    const prescriptionsByDoctor = await Prescription.aggregate([
      {
        $match: {
          status: 'dispensed',
          'dispensingDetails.dispensedBy': userId
        }
      },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get doctor details
    const doctorIds = prescriptionsByDoctor.map(item => item._id);
    const doctors = await User.find({ _id: { $in: doctorIds } }).select('firstName lastName');

    const prescriptionsByDoctorWithDetails = prescriptionsByDoctor.map(item => {
      const doctor = doctors.find(d => d._id.toString() === item._id.toString());
      return {
        doctorId: item._id,
        doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown',
        count: item.count
      };
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalDispensed,
        dispensingTrends,
        prescriptionsByDoctor: prescriptionsByDoctorWithDetails
      }
    });
  } catch (error) {
    console.error('Get pharmacy statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy statistics',
      error: error.message
    });
  }
};

// Search prescription by ID or patient name
export const searchPrescription = async (req, res) => {
  try {
    const { search } = req.query;

    // Check if user is pharmacy staff
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy staff can search prescriptions'
      });
    }

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    // Get prescriptions by ID (exact match)
    const prescriptionByNumber = await Prescription.findOne({ prescriptionNumber: search })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specializations');

    if (prescriptionByNumber) {
      return res.status(200).json({
        success: true,
        prescriptions: [prescriptionByNumber]
      });
    }

    // Search by patient name (fuzzy match)
    // First get patient IDs matching the search term
    const patients = await User.find({
      role: 'patient',
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');

    const patientIds = patients.map(patient => patient._id);

    // Then find prescriptions for these patients
    const prescriptions = await Prescription.find({
      patient: { $in: patientIds },
      status: { $in: ['active', 'dispensed'] }
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specializations')
      .sort({ prescriptionDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error('Search prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching prescriptions',
      error: error.message
    });
  }
};
