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

const micButton = document.getElementById('mic-button');
const stopButton = document.getElementById('stop-button');
const synth = window.speechSynthesis;

micButton.addEventListener('click', () => {
  recognition.start();
  outputYou.textContent = '...';
  outputBot.textContent = 'Processing...';
  loader.style.display = 'block';
  stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
  socket.emit('stop bot');
  recognition.stop();
  synth.cancel();
  stopButton.disabled = true;
  loader.style.display = 'none';
});

recognition.addEventListener('result', (e) => {
  const last = e.results.length - 1;
  const text = e.results[last][0].transcript;
  outputYou.textContent = text;
  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
});

recognition.addEventListener('error', (e) => {
  outputBot.textContent = 'Error: ' + e.error;
  stopButton.disabled = true;
  loader.style.display = 'none';
});

socket.on('bot reply', (replyText) => {
  outputBot.textContent = replyText || '(No answer...)';
  synthVoice(replyText);
  stopButton.disabled = true;
  loader.style.display = 'none';
});

socket.on('bot stopped', (message) => {
  outputBot.textContent = message;
  synth.cancel();
  stopButton.disabled = true;
  loader.style.display = 'none';
});

function synthVoice(text) {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}