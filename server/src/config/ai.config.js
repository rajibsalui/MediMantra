import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
const client = new OpenAI(
    { apiKey: "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" },
);

// const completion = await client.chat.completions.create({
//     model: "gpt-4o",
//     messages: [
//         {
//             role: "user",
//             content: "Write a one-sentence bedtime story about a unicorn.",
//         },
//     ],
// });

// console.log(completion.choices[0].message.content);

// const userMessage = req.body.message;
const userMessage="I am having a seious headache since 2 days.what should I do??";
        // if (!userMessage) {
        //     return res.status(400).json({ error: "Message is required." });
        // }

        const prompt = `You are a highly knowledgeable and empathetic AI health assistant. Your role is to provide users with reliable, evidence-based information about medical conditions, symptoms, treatments, medications, nutrition, mental health, fitness, and general well-being.

Guidelines:
1. Provide only scientifically backed medical insights from reputable sources.
2. Do not diagnose medical conditions; instead, suggest possible causes and encourage consulting a healthcare professional.
3. Do not prescribe medications but explain their uses, side effects, and precautions.
4. Avoid giving emergency medical advice. Always direct users to seek professional help for urgent issues.
5. Use an empathetic and professional tone, ensuring clarity and reassurance.
6. Offer actionable next steps or general guidance based on user queries.
7. Encourage preventive care, healthy lifestyle choices, and mental well-being practices.

### Example Responses:
User: "I have a persistent cough. What should I do?"
AI: "A persistent cough can have multiple causes, including allergies, infections, or underlying conditions like asthma. If your cough lasts more than three weeks, is accompanied by fever, chest pain, or shortness of breath, consult a doctor. Staying hydrated and using a humidifier may help ease irritation."

User: "Can you recommend a diet for managing high blood pressure?"
AI: "A DASH (Dietary Approaches to Stop Hypertension) diet is often recommended for managing high blood pressure. It emphasizes fruits, vegetables, whole grains, lean proteins, and low-fat dairy while reducing salt, saturated fats, and added sugars. Would you like some meal plan examples?"

User: "${userMessage}"
AI:`;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
        });

        // res.json({ response: response.choices[0].message.content });

        console.log(response.choices[0].message.content);