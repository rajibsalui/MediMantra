import { MedibotConversation } from '../models/medibot.model.js';
import { User } from '../models/user.model.js';
import axios from 'axios';

// Record user query and get AI response
export const queryMedibot = async (req, res) => {
  try {
    const { query, context } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Process the query using AI (simulated for now)
    // In a real implementation, this would call an AI service or API
    const response = await processQuery(query, context);

    // Record the interaction
    if (userId) {
      await MedibotConversation.create({
        user: userId,
        query,
        response: response.answer,
        context,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
    }

    res.status(200).json({
      success: true,
      response: response.answer,
      suggestedActions: response.suggestedActions || []
    });
  } catch (error) {
    console.error('Medibot query error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your query',
      error: error.message
    });
  }
};

// Get user interaction history
export const getInteractionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0 } = req.query;

    // Get interactions for the user
    const interactions = await MedibotConversation.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await MedibotConversation.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: interactions.length,
      total,
      interactions
    });
  } catch (error) {
    console.error('Get interaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interaction history',
      error: error.message
    });
  }
};

// Get symptom assessment
export const getSymptomAssessment = async (req, res) => {
  try {
    const { symptoms, age, gender, preExistingConditions } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid symptoms array is required'
      });
    }

    // Process the symptoms (simulated for now)
    // In a real implementation, this would call a medical assessment API
    const assessment = await processSymptomAssessment(symptoms, age, gender, preExistingConditions);

    // Record the interaction
    if (userId) {
      await MedibotConversation.create({
        user: userId,
        query: `Symptom assessment: ${symptoms.join(', ')}`,
        response: JSON.stringify(assessment),
        context: 'symptom_assessment',
        metadata: {
          symptoms,
          age,
          gender,
          preExistingConditions,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
    }

    res.status(200).json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Symptom assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing symptom assessment',
      error: error.message
    });
  }
};

// Get medication information
export const getMedicationInfo = async (req, res) => {
  try {
    const { medication } = req.params;
    const userId = req.user ? req.user._id : null;

    if (!medication) {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required'
      });
    }

    // Fetch medication information (simulated for now)
    // In a real implementation, this would call a medication database API
    const medicationInfo = await fetchMedicationInfo(medication);

    // Record the interaction
    if (userId) {
      await MedibotConversation.create({
        user: userId,
        query: `Medication info: ${medication}`,
        response: JSON.stringify(medicationInfo),
        context: 'medication_info',
        metadata: {
          medication,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
    }

    res.status(200).json({
      success: true,
      medicationInfo
    });
  } catch (error) {
    console.error('Get medication info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medication information',
      error: error.message
    });
  }
};

// Delete interaction
export const deleteInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find interaction
    const interaction = await MedibotConversation.findById(id);
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    // Check authorization
    if (interaction.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this interaction'
      });
    }

    // Delete interaction
    await interaction.remove();

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting interaction',
      error: error.message
    });
  }
};

// Get usage statistics (admin only)
export const getUsageStatistics = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access usage statistics'
      });
    }

    // Get total interactions
    const totalInteractions = await MedibotConversation.countDocuments();

    // Get interactions by context
    const contextStats = await MedibotConversation.aggregate([
      { $group: { _id: '$context', count: { $sum: 1 } } }
    ]);

    // Get daily interaction counts
    const dailyStats = await MedibotConversation.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get most common queries
    const commonQueries = await MedibotConversation.aggregate([
      { $group: { 
          _id: '$query', 
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalInteractions,
        contextStats,
        dailyStats,
        commonQueries
      }
    });
  } catch (error) {
    console.error('Get usage statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching usage statistics',
      error: error.message
    });
  }
};

// Helper function to process user query (simulated)
const processQuery = async (query, context) => {
  // This would be integrated with a real AI service in production
  
  // Simple keyword matching for demonstration
  const lowercaseQuery = query.toLowerCase();
  let answer = '';
  const suggestedActions = [];
  
  if (lowercaseQuery.includes('headache')) {
    answer = 'Headaches can be caused by various factors, including stress, dehydration, lack of sleep, or underlying health conditions. For mild headaches, rest, hydration, and over-the-counter pain relievers may help. If headaches are severe or persistent, please consult a doctor.';
    suggestedActions.push({ type: 'book_appointment', label: 'Book a consultation' });
  } else if (lowercaseQuery.includes('fever')) {
    answer = 'Fever is often a sign that your body is fighting an infection. Rest, hydration, and appropriate fever-reducing medications can help. If fever persists over 3 days or is very high (over 39°C/102°F), please seek medical attention.';
    suggestedActions.push({ type: 'symptom_assessment', label: 'Check your symptoms' });
  } else if (lowercaseQuery.includes('covid') || lowercaseQuery.includes('coronavirus')) {
    answer = 'COVID-19 symptoms may include fever, cough, fatigue, loss of taste or smell, and difficulty breathing. If you suspect you have COVID-19, please get tested and follow isolation guidelines. Seek immediate medical attention if you experience severe symptoms.';
    suggestedActions.push({ type: 'covid_info', label: 'COVID-19 guidelines' });
  } else {
    answer = 'I understand you have a health question. To provide the best guidance, could you share more specific details about your symptoms or concerns?';
    suggestedActions.push({ type: 'symptom_assessment', label: 'Start symptom assessment' });
  }
  
  return { answer, suggestedActions };
};

// Helper function to process symptom assessment (simulated)
const processSymptomAssessment = async (symptoms, age, gender, preExistingConditions) => {
  // This would connect to a real medical assessment API in production
  
  // Simple simulation for demonstration
  const commonSymptoms = {
    'headache': { urgency: 'low', possibleCauses: ['stress', 'dehydration', 'migraine', 'eye strain'] },
    'fever': { urgency: 'medium', possibleCauses: ['infection', 'inflammation', 'heat exhaustion'] },
    'cough': { urgency: 'medium', possibleCauses: ['common cold', 'allergies', 'asthma', 'infection'] },
    'chest pain': { urgency: 'high', possibleCauses: ['heart issues', 'anxiety', 'muscle strain', 'lung problems'] },
    'shortness of breath': { urgency: 'high', possibleCauses: ['anxiety', 'asthma', 'heart issues', 'lung problems'] },
    'fatigue': { urgency: 'low', possibleCauses: ['stress', 'lack of sleep', 'depression', 'anemia'] }
  };
  
  let urgencyLevel = 'low';
  const matchedSymptoms = [];
  
  // Analyze symptoms
  symptoms.forEach(symptom => {
    const lowercaseSymptom = symptom.toLowerCase();
    if (commonSymptoms[lowercaseSymptom]) {
      matchedSymptoms.push({
        symptom: lowercaseSymptom,
        ...commonSymptoms[lowercaseSymptom]
      });
      
      // Upgrade urgency if higher level is found
      if (commonSymptoms[lowercaseSymptom].urgency === 'high' ||
         (commonSymptoms[lowercaseSymptom].urgency === 'medium' && urgencyLevel === 'low')) {
        urgencyLevel = commonSymptoms[lowercaseSymptom].urgency;
      }
    }
  });
  
  // Check for combinations indicating higher urgency
  if (symptoms.includes('fever') && symptoms.includes('cough')) {
    urgencyLevel = 'medium';
  }
  
  if (symptoms.includes('chest pain') && symptoms.includes('shortness of breath')) {
    urgencyLevel = 'high';
  }
  
  // Consider pre-existing conditions
  if (preExistingConditions && preExistingConditions.length > 0) {
    if (preExistingConditions.some(c => 
      ['heart disease', 'diabetes', 'asthma', 'immunocompromised'].includes(c.toLowerCase())
    )) {
      // Upgrade urgency for high-risk conditions
      if (urgencyLevel === 'low') urgencyLevel = 'medium';
      else if (urgencyLevel === 'medium') urgencyLevel = 'high';
    }
  }
  
  // Consider age as a factor
  if (age) {
    if (age < 12 || age > 65) {
      // Upgrade urgency for very young or older people
      if (urgencyLevel === 'low') urgencyLevel = 'medium';
    }
  }
  
  // Recommendations based on urgency
  let recommendation = '';
  switch(urgencyLevel) {
    case 'high':
      recommendation = 'Your symptoms suggest you should seek medical attention promptly. Please consult with a healthcare provider as soon as possible.';
      break;
    case 'medium':
      recommendation = 'Your symptoms may require medical attention. Consider scheduling an appointment with a healthcare provider in the next few days.';
      break;
    case 'low':
      recommendation = 'Your symptoms appear to be mild. Rest, stay hydrated, and monitor your condition. If symptoms persist or worsen, consult a healthcare provider.';
      break;
    default:
      recommendation = 'Please consult with a healthcare provider for proper evaluation of your symptoms.';
  }
  
  return {
    symptoms: matchedSymptoms,
    urgencyLevel,
    recommendation,
    disclaimer: 'This assessment is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.'
  };
};

// Helper function to fetch medication information (simulated)
const fetchMedicationInfo = async (medication) => {
  // This would connect to a real medication database API in production
  
  // Simple simulation for demonstration
  const commonMedications = {
    'aspirin': {
      genericName: 'acetylsalicylic acid',
      brandNames: ['Bayer', 'Ecotrin', 'Bufferin'],
      category: 'NSAID',
      uses: ['Pain relief', 'Fever reduction', 'Anti-inflammatory', 'Blood thinner'],
      sideEffects: ['Stomach upset', 'Heartburn', 'Bleeding risk', 'Allergic reactions'],
      precautions: ['Avoid in children (risk of Reye\'s syndrome)', 'Use caution with ulcers or bleeding disorders']
    },
    'ibuprofen': {
      genericName: 'ibuprofen',
      brandNames: ['Advil', 'Motrin', 'Nurofen'],
      category: 'NSAID',
      uses: ['Pain relief', 'Fever reduction', 'Anti-inflammatory'],
      sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness', 'Hypertension'],
      precautions: ['Use caution with heart conditions, kidney problems, or ulcers']
    },
    'lisinopril': {
      genericName: 'lisinopril',
      brandNames: ['Prinivil', 'Zestril'],
      category: 'ACE inhibitor',
      uses: ['High blood pressure', 'Heart failure', 'Post-heart attack treatment'],
      sideEffects: ['Dry cough', 'Dizziness', 'Fatigue', 'Hyperkalemia'],
      precautions: ['Avoid during pregnancy', 'Use caution with kidney disease']
    }
  };
  
  const lowercaseMed = medication.toLowerCase();
  
  if (commonMedications[lowercaseMed]) {
    return {
      name: medication,
      ...commonMedications[lowercaseMed],
      disclaimer: 'This information is for educational purposes only and does not replace professional medical advice.'
    };
  } else {
    return {
      name: medication,
      message: 'Detailed information for this medication is not available in our database.',
      recommendation: 'Please consult with a healthcare provider or pharmacist for information about this medication.',
      disclaimer: 'This information is for educational purposes only and does not replace professional medical advice.'
    };
  }
};
