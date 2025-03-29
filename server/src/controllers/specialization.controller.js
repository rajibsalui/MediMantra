import Specialization from '../models/specialization.model.js';
import Doctor from '../models/doctor.model.js';

// Get all specializations
export const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find()
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: specializations.length,
      specializations
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specializations',
      error: error.message
    });
  }
};

// Get specialization by ID
export const getSpecializationById = async (req, res) => {
  try {
    const { id } = req.params;

    const specialization = await Specialization.findById(id);
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    res.status(200).json({
      success: true,
      specialization
    });
  } catch (error) {
    console.error('Get specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specialization',
      error: error.message
    });
  }
};

// Create new specialization (admin only)
export const createSpecialization = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create specializations'
      });
    }

    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if specialization already exists
    const existingSpecialization = await Specialization.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingSpecialization) {
      return res.status(400).json({
        success: false,
        message: 'Specialization with this name already exists'
      });
    }

    // Create specialization
    const specialization = await Specialization.create({
      name,
      description,
      icon,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Specialization created successfully',
      specialization
    });
  } catch (error) {
    console.error('Create specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating specialization',
      error: error.message
    });
  }
};

// Update specialization (admin only)
export const updateSpecialization = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update specializations'
      });
    }

    const { id } = req.params;
    const { name, description, icon, isActive } = req.body;

    // Find specialization
    const specialization = await Specialization.findById(id);
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== specialization.name) {
      const existingSpecialization = await Specialization.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingSpecialization) {
        return res.status(400).json({
          success: false,
          message: 'Specialization with this name already exists'
        });
      }
      
      specialization.name = name;
    }

    // Update other fields
    if (description !== undefined) specialization.description = description;
    if (icon !== undefined) specialization.icon = icon;
    if (isActive !== undefined) specialization.isActive = isActive;
    
    specialization.updatedBy = req.user._id;
    specialization.updatedAt = new Date();

    await specialization.save();

    res.status(200).json({
      success: true,
      message: 'Specialization updated successfully',
      specialization
    });
  } catch (error) {
    console.error('Update specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating specialization',
      error: error.message
    });
  }
};

// Delete specialization (admin only)
export const deleteSpecialization = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete specializations'
      });
    }

    const { id } = req.params;

    // Check if specialization is in use by any doctors
    const inUse = await Doctor.exists({ specializations: id });
    
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete specialization that is in use by doctors'
      });
    }

    // Find and delete specialization
    const specialization = await Specialization.findByIdAndDelete(id);
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Specialization deleted successfully'
    });
  } catch (error) {
    console.error('Delete specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting specialization',
      error: error.message
    });
  }
};

// Get popular specializations
export const getPopularSpecializations = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Find specializations and count doctors in each
    const specializations = await Specialization.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: 'specializations',
          as: 'doctors'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          icon: 1,
          doctorCount: { $size: '$doctors' }
        }
      },
      { $sort: { doctorCount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      count: specializations.length,
      specializations
    });
  } catch (error) {
    console.error('Get popular specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular specializations',
      error: error.message
    });
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if specialization exists
    const specialization = await Specialization.findById(id);
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    // Get doctors with this specialization
    const doctors = await Doctor.find({
      specializations: id,
      verificationStatus: 'verified'
    })
      .populate('user', 'firstName lastName email avatar')
      .sort({ 'ratings.average': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments({
      specializations: id,
      verificationStatus: 'verified'
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      doctors
    });
  } catch (error) {
    console.error('Get doctors by specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};
