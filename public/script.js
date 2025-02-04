const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');

// Send the message when clicking the send button or pressing Enter.
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Check if the browser supports Speech Recognition.
let recognition;
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  // Set language to Arabic
  recognition.lang = 'ar-EG';

  // When speech recognition returns a result,
  // set the recognized text into the input and send the message.
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage(); // Send the recognized text to the backend.
  };

  // Show a temporary indicator when speech recognition is active.
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

  // Remove the indicator when speech recognition ends.
  recognition.onend = () => {
    const indicator = document.getElementById('listening-indicator');
    if (indicator) {
      indicator.remove();
    }
  };
} else {
  // Disable the voice button if speech recognition is not supported.
  voiceButton.disabled = false;
  voiceButton.title = "ميزة التعرف على الصوت غير مدعومة في هذا المتصفح.";
}

// Start speech recognition when the voice button is clicked.
voiceButton.addEventListener('click', () => {
  if (recognition) {
    recognition.start();
  }
});

// Function to perform text-to-speech (speak the assistant's reply)
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-EG'; // Set the output language to Arabic.
  window.speechSynthesis.speak(utterance);
}

// Function to append a message (user or assistant) to the chat container.
function appendMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);

  if (sender === 'assistant') {
    // For assistant messages, include an AI robot image.
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    const img = document.createElement('img');
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
    // For user messages, simply add the text.
    messageElement.textContent = text;
  }

  chatContainer.appendChild(messageElement);
  // Auto-scroll to the bottom.
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to send the message to your backend API.
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Display the user's message in the chat.
  appendMessage(message, 'user');
  userInput.value = '';

  try {
    // Call your Node.js backend at the /api/chat endpoint.
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const reply = data.reply;
    appendMessage(reply, 'assistant');
    speakText(reply);
  } catch (error) {
    console.error("Error:", error);
    appendMessage("عذراً، حدث خطأ أثناء معالجة طلبك.", 'assistant');
    speakText("عذراً، حدث خطأ أثناء معالجة طلبك.");
  }
}
