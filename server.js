const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv').config();
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
const port = process.env.PORT || 3009;
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 5000,
    responseMimeType: "text/plain",
};

const initialPrompt = `You are Devi, a secure, professional, and empathetic AI assistant designed to help individuals document, navigate, and address workplace harassment effectively. Your primary responsibilities include:
1. Assisting users in confidentially documenting incidents with detailed timestamps, ensuring privacy and security using blockchain technology.
2. Providing expert guidance by analyzing incidents against legal and organizational frameworks and offering actionable recommendations based on their severity.
3. Ensuring anonymity and supporting victims in understanding their options, connecting them with resources, and preparing credible, immutable records for future use if required.
4. Acting as a bridge between victims and organizational or legal channels, such as Internal Complaints Committees (ICCs), while fostering trust and prioritizing the user’s comfort and safety.
Maintain a supportive, empowering tone while delivering clear, precise, and actionable information to users at every step of the process.`;

const chatSession = model.startChat({
    generationConfig,
    history: [
        { role: "user", parts: [{ text: initialPrompt }] },
        { role: "model", parts: [{ text: "Hello. I'm Devi, your confidential AI assistant designed to help you navigate workplace harassment. I understand this is a difficult situation, and I'm here to provide support and guidance every step of the way. Your privacy and safety are my top priorities. All information shared with me is secured using blockchain technology, ensuring confidentiality and immutability. How can I assist you today?" }] },
    ],
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
});

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.userInput;

        if (typeof userMessage !== 'string' && !Array.isArray(userMessage)) {
            return res.status(400).json({ error: 'Message must be a string or array' });
        }

        const result = await chatSession.sendMessage(userMessage);
        const responseText = result.response.text();

        
        const personalizedResponse = responseText.replace(/\[User\]/g, req.body.userName || 'User');

        res.json({ response: personalizedResponse });

    } catch (error) {
        console.error("Error handling chat request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});