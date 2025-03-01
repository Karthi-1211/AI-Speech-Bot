'use strict';

const socket = io();

const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');
const loader = document.getElementById('loader');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Get buttons
const micButton = document.getElementById('mic-button');
const stopButton = document.getElementById('stop-button');

let synth = window.speechSynthesis;

micButton.addEventListener('click', () => {
  recognition.start();
  outputYou.textContent = '...';
  outputBot.textContent = 'Processing...';
  loader.style.display = 'block';
  stopButton.disabled = false;
  console.log('Mic clicked, recognition started');
});

stopButton.addEventListener('click', () => {
  socket.emit('stop bot');
  recognition.stop();
  synth.cancel();
  stopButton.disabled = true;
  loader.style.display = 'none';
  console.log('Stop button clicked');
});

recognition.addEventListener('result', (e) => {
  console.log('Result has been detected.');
  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  outputYou.textContent = text;
  console.log('Confidence: ' + e.results[0][0].confidence);

  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
  console.log('Speech ended, recognition stopped');
});

recognition.addEventListener('error', (e) => {
  outputBot.textContent = 'Error: ' + e.error;
  stopButton.disabled = true;
  loader.style.display = 'none';
  console.log('Speech recognition error:', e.error);
});

socket.on('bot reply', (replyText) => {
  if (replyText === '') replyText = '(No answer...)';
  outputBot.textContent = replyText;
  synthVoice(replyText);
  stopButton.disabled = true;
  loader.style.display = 'none';
  console.log('Bot reply received:', replyText);
});

socket.on('bot stopped', (message) => {
  outputBot.textContent = message;
  synth.cancel();
  stopButton.disabled = true;
  loader.style.display = 'none';
  console.log('Bot stopped:', message);
});

function synthVoice(text) {
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  synth.speak(utterance);
}

/*document.getElementById('feedbackForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const feedback = Object.fromEntries(formData.entries());
  console.log('Feedback submitted:', feedback);
  alert('Thank you for your feedback!');
  this.reset();
});*/
document.getElementById('feedbackForm').addEventListener('submit', function () {
  setTimeout(function () {
    document.getElementById('feedbackForm').reset(); // Clear the form fields
  }, 1000); // Clear the form after 1 second (adjust as needed)
});