import CallRecord from '../models/callRecord.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * Get call history for the current user
 * @route GET /api/video-calls/history
 */
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all calls where the user is either caller or receiver
    const callRecords = await CallRecord.find({
      $or: [
        { caller: userId },
        { receiver: userId }
      ]
    })
      .populate('caller', 'firstName lastName profileImage role')
      .populate('receiver', 'firstName lastName profileImage role')
      .populate('appointment', 'appointmentDate appointmentTime')
      .sort({ startTime: -1 })
      .limit(50); // Limit to last 50 calls
    
    // Format call records for client
    const formattedRecords = callRecords.map(record => {
      // Determine if the current user is the caller or receiver
      const isOutgoing = record.caller._id.toString() === userId.toString();
      const otherParty = isOutgoing ? record.receiver : record.caller;
      
      return {
        _id: record._id,
        participant: {
          _id: otherParty._id,
          name: `${otherParty.firstName} ${otherParty.lastName}`,
          profileImage: otherParty.profileImage,
          role: otherParty.role
        },
        appointment: record.appointment,
        startTime: record.startTime,
        endTime: record.endTime,
        duration: record.duration,
        callType: record.callType,
        status: record.status,
        isOutgoing,
        createdAt: record.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Error getting call history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call history',
      error: error.message
    });
  }
};

/**
 * Save a call record
 * @route POST /api/video-calls/record
 */
export const saveCallRecord = async (req, res) => {
  try {
    const { 
      receiverId, 
      appointmentId, 
      startTime, 
      endTime, 
      duration, 
      callType, 
      status, 
      notes 
    } = req.body;
    
    const callerId = req.user._id;
    
    // Validate receiver ID
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID'
      });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }
    
    // Create new call record
    const callRecord = await CallRecord.create({
      caller: callerId,
      receiver: receiverId,
      appointment: appointmentId || null,
      startTime: startTime || new Date(),
      endTime: endTime || null,
      duration: duration || 0,
      callType: callType || 'video',
      status: status || 'completed',
      notes: notes || ''
    });
    
    res.status(201).json({
      success: true,
      data: callRecord,
      message: 'Call record saved successfully'
    });
  } catch (error) {
    console.error('Error saving call record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save call record',
      error: error.message
    });
  }
};
