// server.js
require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided.' });
  }

  // Define your system prompt. (Customize as needed.)
  const systemMessage = {
    role: "system",
    content: `أنت أمين مكتبة مساعد. يجب أن تفهم الأسئلة سواء كانت باللغة العبرية أو العربية أو الإنجليزية، ولكن يجب أن ترد دائماً باللغة العربية.
هذه بيانات مكتبة وهمية للكتب التعليمية للصفوف من 1 إلى 6:
 الفسم 1 ،"الرياضيات للصف الأول" - المادة: رياضيات، الصف: 1، متوفر: نعم.
 الفسم 1 ،"اللغة العربية للصف الأول" - المادة: لغة عربية، الصف: 1، متوفر: نعم.
 الفسم 1 ،"العلوم للصف الأول" - المادة: علوم، الصف: 1، متوفر: نعم.
 الفسم 1 ،"الرياضيات للصف الثاني" - المادة: رياضيات، الصف: 2، متوفر: نعم.
 الفسم 1 ،"اللغة العربية للصف الثاني" - المادة: لغة عربية، الصف: 2، متوفر: نعم.
 الفسم 1 ،"العلوم للصف الثاني" - المادة: علوم، الصف: 2، متوفر: نعم.
 الفسم 2 ،"الرياضيات للصف الثالث" - المادة: رياضيات، الصف: 3، متوفر: نعم.
 الفسم 2 ،"اللغة العربية للصف الثالث" - المادة: لغة عربية، الصف: 3، متوفر: نعم.
 الفسم 2 ،"العلوم للصف الثالث" - المادة: علوم، الصف: 3، متوفر: نعم.
 الفسم 2 ،"التاريخ للصف الرابع" - المادة: تاريخ، الصف: 4، متوفر: نعم.
 الفسم 2 ،"الجغرافيا للصف الرابع" - المادة: جغرافيا، الصف: 4، متوفر: نعم.
 الفسم 2 ،"الرياضيات للصف الرابع" - المادة: رياضيات، الصف: 4، متوفر: نعم.
 الفسم 3 ،"اللغة العربية للصف الخامس" - المادة: لغة عربية، الصف: 5، متوفر: نعم.
 الفسم 3 ،"العلوم للصف الخامس" - المادة: علوم، الصف: 5، متوفر: نعم.
 الفسم 3 ،"التاريخ للصف الخامس" - المادة: تاريخ، الصف: 5، متوفر: نعم.
 الفسم 4 ،"الرياضيات للصف السادس" - المادة: رياضيات، الصف: 6، متوفر: نعم.
 الفسم 4 ،"اللغة العربية للصف السادس" - المادة: لغة عربية، الصف: 6، متوفر: نعم.
 الفسم 4 ،"العلوم للصف السادس" - المادة: علوم، الصف: 6، متوفر: نعم.
 الفسم 4 ،"التاريخ للصف السادس" - المادة: تاريخ، الصف: 6، متوفر: نعم.
 الفسم 4 ،"التربية الإسلامية للصف السادس" - المادة: تربية إسلامية، الصف: 6، متوفر: نعم.

أجب على أي أسئلة حول توفر الكتب، المواد، الصفوف، والمزيد بناءً على هذه البيانات.`
  };

  const userMessage = {
    role: "user",
    content: message
  };
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    console.log('response',response);
    
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
