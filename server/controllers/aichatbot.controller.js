import aiConfig from "../config/ai.config.js";
import chatMemory from "../utils/chatMemory.js";

const chatbotController = {
  async handleUserQuery(req, res) {
    try {
      // Fixed the query extraction from request
      const { query, userId } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required." });
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is required for chat memory." });
      }

      if (!aiConfig.client) {
        return res.status(500).json({ error: "AI client is not configured." });
      }

      // Retrieve conversation history for this user
      const conversationHistory = chatMemory.getConversation(userId);
      
      // Prepare messages array with system prompt, conversation history, and new user query
      const messages = [
        { role: "system", content: aiConfig.prompts.healthAssistant },
        ...conversationHistory,
        { role: "user", content: query }
      ];

      const response = await aiConfig.client.chat.completions.create({
        model: aiConfig.models.default,
        messages: messages,
        temperature: aiConfig.defaultParams.temperature,
        max_tokens: aiConfig.defaultParams.max_tokens
      });

      const rawaiMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";
      // remove  all special characters from the response
      const aiMessage = rawaiMessage.replace(/[^\w\s.,?!'-]/g, ''); 
      // Store the conversation exchange
      chatMemory.addExchange(userId, { role: "user", content: query });
      chatMemory.addExchange(userId, { role: "assistant", content: aiMessage });
      
      console.log("AI response:", aiMessage);
      res.status(200).json({ response: aiMessage });
    } catch (error) {
      console.error("Error handling user query:", error);
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  }
};

export default chatbotController;
