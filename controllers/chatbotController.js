// controllers/chatbotController.js
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.API_KEY,
});

exports.handleChatbotRequest = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1-distill-llama-70b:free', // tu peux aussi tester gpt-4 si tu veux plus de précision
      messages: [
        {
          role: 'system',
          content: `
Tu es un assistant médical intelligent. Ton rôle est d'analyser les symptômes décrits librement par un utilisateur
et de l'orienter vers le bon spécialiste médical. N'utilise pas de mots-clés.
Utilise ton raisonnement pour comprendre la situation. Si les symptômes sont graves, conseille d'aller aux urgences.
Sois clair, rassurant et professionnel.
        `,
        },
        { role: 'user', content: query },
      ],
    });
    console.log('Chatbot Response:', completion.choices[0].message.content);
    res.json(completion.choices[0].message.content);
  } catch (error) {
    console.error('Chatbot Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};
