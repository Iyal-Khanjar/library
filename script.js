const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');

// Add event listeners for the send button and Enter key
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Set up speech recognition if supported by the browser
let recognition;
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  // Force language to Arabic so Arabic speech is recognized correctly
  recognition.lang = 'ar-EG';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage(); // Auto-send the recognized text
  };

  // Show a listening indicator when recognition starts
  recognition.onstart = () => {
    let indicator = document.getElementById('listening-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'listening-indicator';
      indicator.style.position = 'fixed';
      indicator.style.bottom = '20px';
      indicator.style.left = '50%';
      indicator.style.transform = 'translateX(-50%)';
      indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      indicator.style.color = '#fff';
      indicator.style.padding = '10px 20px';
      indicator.style.borderRadius = '10px';
      indicator.style.zIndex = '9999';
      indicator.textContent = 'جارٍ الاستماع...';
      document.body.appendChild(indicator);
    } else {
      indicator.style.display = 'block';
    }
  };

  // Remove the indicator when recognition ends
  recognition.onend = () => {
    const indicator = document.getElementById('listening-indicator');
    if (indicator) {
      indicator.remove();
    }
  };
} else {
  voiceButton.disabled = true;
  voiceButton.title = "ميزة التعرف على الصوت غير مدعومة في هذا المتصفح.";
}

// Start speech recognition when the voice button is clicked
voiceButton.addEventListener('click', () => {
  if (recognition) {
    recognition.start();
  }
});

// Function to speak a given text using the Web Speech API (Text-to-Speech)
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  // Force output in Arabic
  utterance.lang = 'ar-EG';
  window.speechSynthesis.speak(utterance);
}

// Append a message (from user or assistant) to the chat container.
// For assistant messages, an AI robot image is shown beside the text.
function appendMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  
  if (sender === 'assistant') {
    // Create a container for the robot image and the text
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    const img = document.createElement('img');
    // Use any AI robot image URL of your choice. This is an example URL:
    img.src = 'https://img.icons8.com/fluency/48/000000/robot.png';
    img.alt = 'AI Robot';
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.marginRight = '10px';

    const textElement = document.createElement('span');
    textElement.textContent = text;

    container.appendChild(img);
    container.appendChild(textElement);
    messageElement.appendChild(container);
  } else {
    // For user messages, simply add the text
    messageElement.textContent = text;
  }

  chatContainer.appendChild(messageElement);
  // Scroll to the bottom so the new message is visible
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send the user's message to the OpenAI API
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Display the user's message in the chat
  appendMessage(message, 'user');
  userInput.value = '';

  // Prepare the prompt for the OpenAI API.
  const systemMessage = {
    role: "system",
    content: `أنت أمين مكتبة مساعد. يجب أن تفهم الأسئلة سواء كانت باللغة العبرية أو العربية أو الإنجليزية، ولكن يجب أن ترد دائماً باللغة العربية.
هذه بيانات مكتبة وهمية للكتب التعليمية للصفوف من 1 إلى 6:
 الفسم 1 ،ؤ "الرياضيات للصف الأول" - المادة: رياضيات، الصف: 1، متوفر: نعم.
 الفسم 1 ،اللغة العربية للصف الأول" - المادة: لغة عربية، الصف: 1، متوفر: نعم.
 الفسم 1 ،العلوم للصف الأول" - المادة: علوم، الصف: 1، متوفر: نعم.
 الفسم 1 ،الرياضيات للصف الثاني" - المادة: رياضيات، الصف: 2، متوفر: نعم.
 الفسم 1 ،اللغة العربية للصف الثاني" - المادة: لغة عربية، الصف: 2، متوفر: نعم.
 الفسم 1 ،العلوم للصف الثاني" - المادة: علوم، الصف: 2، متوفر: نعم.
 الفسم 2 ،الرياضيات للصف الثالث" - المادة: رياضيات، الصف: 3، متوفر: نعم.
 الفسم 2 ،اللغة العربية للصف الثالث" - المادة: لغة عربية، الصف: 3، متوفر: نعم.
 الفسم 2 ،العلوم للصف الثالث" - المادة: علوم، الصف: 3، متوفر: نعم.
 الفسم 2 ،التاريخ للصف الرابع" - المادة: تاريخ، الصف: 4، متوفر: نعم.
 الفسم 2 ،الجغرافيا للصف الرابع" - المادة: جغرافيا، الصف: 4، متوفر: نعم.
 الفسم 2 ،الرياضيات للصف الرابع" - المادة: رياضيات، الصف: 4، متوفر: نعم.
 الفسم 3 ،اللغة العربية للصف الخامس" - المادة: لغة عربية، الصف: 5، متوفر: نعم.
 الفسم 3 ،العلوم للصف الخامس" - المادة: علوم، الصف: 5، متوفر: نعم.
 الفسم 3 ،التاريخ للصف الخامس" - المادة: تاريخ، الصف: 5، متوفر: نعم.
 الفسم 4 ،الرياضيات للصف السادس" - المادة: رياضيات، الصف: 6، متوفر: نعم.
 الفسم 4 ،اللغة العربية للصف السادس" - المادة: لغة عربية، الصف: 6، متوفر: نعم.
 الفسم 4 ،العلوم للصف السادس" - المادة: علوم، الصف: 6، متوفر: نعم.
 الفسم 4 ،التاريخ للصف السادس" - المادة: تاريخ، الصف: 6، متوفر: نعم.
 الفسم 4 ،التربية الإسلامية للصف السادس" - المادة: تربية إسلامية، الصف: 6، متوفر: نعم.

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
        // Replace YOUR_API_KEY_HERE with your actual OpenAI API key.
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`خطأ: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const reply = data.choices[0].message.content.trim();
    appendMessage(reply, 'assistant');
    speakText(reply);
  } catch (error) {
    console.error("حدث خطأ أثناء الاتصال بواجهة OpenAI API:", error);
    appendMessage("عذراً، حدث خطأ أثناء معالجة طلبك.", 'assistant');
    speakText("عذراً، حدث خطأ أثناء معالجة طلبك.");
  }
}
