import aiConfig from '../config/ai.config.js';

/**
 * @desc    Analyze symptoms using AI and provide health recommendations
 * @route   POST /api/symptom-checker/analyze
 * @access  Public
 */
export const analyzeSymptoms = async (req, res) => {
  try {
    const { 
      age, 
      gender, 
      symptoms, 
      duration, 
      medicalHistory, 
      currentMedications,
      allergies,
      additionalInfo
    } = req.body;
    
    // Validate required fields
    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Symptoms description is required'
      });
    }
    
    // Basic validation for age
    if (age && (isNaN(age) || age < 0 || age > 120)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age'
      });
    }
    
    // Check if OpenAI client is available
    if (!aiConfig.client) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured'
      });
    }
    
    // Build the prompt for the AI
    const promptMessage = buildSymptomAnalysisPrompt({
      age,
      gender,
      symptoms,
      duration,
      medicalHistory,
      currentMedications,
      allergies,
      additionalInfo
    });
    
    // Call OpenAI API
    const response = await aiConfig.client.chat.completions.create({
      model: aiConfig.models.default,
      messages: [
        {
          role: "system",
          content: `You are a medical assistant AI that helps analyze symptoms. 
          You DO NOT diagnose conditions, but provide informational analysis.
          Format your response in JSON with these fields:
          1. possibleConditions: Array of potential conditions worth discussing with a doctor
          2. recommendations: Array of general recommendations
          3. urgencyLevel: "Low", "Medium", or "High"
          4. suggestedSpecialist: Type of doctor that might be appropriate
          5. relevantQuestions: Additional questions a doctor might ask
          6. disclaimer: Medical disclaimer text`
        },
        { role: "user", content: promptMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000,
    });
    
    // Parse and clean up the AI response
    const aiResponse = JSON.parse(response.choices[0].message.content);
    
    // Return formatted response
    res.status(200).json({
      success: true,
      data: {
        possibleConditions: aiResponse.possibleConditions || [],
        recommendations: aiResponse.recommendations || [],
        urgencyLevel: aiResponse.urgencyLevel || "Medium",
        suggestedSpecialist: aiResponse.suggestedSpecialist || "General practitioner",
        relevantQuestions: aiResponse.relevantQuestions || [],
        disclaimer: aiResponse.disclaimer || "This is not a medical diagnosis. Please consult with a healthcare professional."
      }
    });
    
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing symptoms',
      error: error.message
    });
  }
};

/**
 * Build a comprehensive prompt for symptom analysis
 */
function buildSymptomAnalysisPrompt(data) {
  const { 
    age, 
    gender, 
    symptoms, 
    duration, 
    medicalHistory, 
    currentMedications,
    allergies,
    additionalInfo 
  } = data;
  
  let prompt = `Analyze the following medical information and provide health insights:\n\n`;
  
  if (age) prompt += `Age: ${age}\n`;
  if (gender) prompt += `Gender: ${gender}\n`;
  prompt += `Primary Symptoms: ${symptoms}\n`;
  if (duration) prompt += `Duration: ${duration}\n`;
  if (medicalHistory && medicalHistory.trim() !== '') prompt += `Medical History: ${medicalHistory}\n`;
  if (currentMedications && currentMedications.trim() !== '') prompt += `Current Medications: ${currentMedications}\n`;
  if (allergies && allergies.trim() !== '') prompt += `Allergies: ${allergies}\n`;
  if (additionalInfo && additionalInfo.trim() !== '') prompt += `Additional Information: ${additionalInfo}\n`;
  
  prompt += `\nBased on this information, please provide a detailed analysis including:
  1. Possible conditions that might be associated with these symptoms (not a diagnosis)
  2. General recommendations for the patient
  3. An assessment of urgency (low, medium, high)
  4. What type of specialist might be appropriate to consult
  5. Additional relevant questions a doctor might ask
  6. A clear medical disclaimer about the limitations of this analysis

  Return the analysis formatted as JSON.`;
  
  return prompt;
}