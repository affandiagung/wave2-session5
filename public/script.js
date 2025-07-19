const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');



let chatHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);


  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });


  input.value = '';
  input.disabled = true
  const sentButton = form.querySelector('button')
  const thinking = appendMessage('bot', 'Memproses...');

  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: chatHistory }),
    });

    chatBox.removeChild(thinking);
    const data = await response.json();

    if (data.result) {
      appendMessage('bot', data.result);

      // Tambahkan balasan bot ke chat history
      chatHistory.push({
        role: "model",
        parts: [{ text: data.result }],
      });
    } else {
      appendMessage('bot', 'Tidak ada respon dari AI.');
    }
  } catch (error) {
    console.error('Error:', error);
    appendMessage('bot', 'Terjadi kesalahan saat menghubungi server.');
  } finally {
    input.disabled = false
  }
});


function appendMessage(sender, message) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;

  div.innerHTML = formatText(message);
  chatBox.appendChild(div);
  return div;
}

function formatText(text) {
  // Bold (**teks** → <strong>teks</strong>)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Bullet list: * item → <li>item</li>
  text = text.replace(/\* (.*?)\n/g, '<li>$1</li>');

  // Tambahkan <ul> jika ada <li>
  if (text.includes('<li>')) {
    text = text.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  }

  // Pecah paragraf (newline ganda)
  text = text.replace(/\n{2,}/g, '</p><p>');
  text = `<p>${text}</p>`; // Bungkus semua dalam <p>

  return text;
}