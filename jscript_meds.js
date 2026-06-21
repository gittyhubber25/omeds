const API_URL = 'https://script.google.com/macros/s/AKfycbx7ltYQuDARGGKfGHIR6jcRvXQsfMzrweaV4i8pAiWhyBxN0GmaSIVqn7jYfHf9nhSd/exec';

async function loadMeds() {
  const response = await fetch(API_URL);
  const data = await response.json();
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    let status = data[i][2];
    const lastGiven = data[i][3];
    const availableAgain = data[i][4];
    const card = document.getElementById(id);
    if (!card) continue;
    const availableDate = new Date(availableAgain);
    const availableTime = availableDate.getTime();
    if (!isNaN(availableTime) && now < availableDate) {
      status = 'NOT READY';
    } else {
      status = 'READY';
    }
    card.querySelector('.status').textContent = status;
    card.querySelector('.last-given').textContent = 'Last Given: ' + lastGiven;
    if (status === 'READY') {
      card.querySelector('.available-again').textContent = 'Available Again: Ready Now';
      card.classList.remove('not-ready');
      card.classList.add('ready');
      card.querySelector('button').style.display = 'inline-block';
    } else {
      card.querySelector('.available-again').textContent = 'Available Again: ' + availableAgain;
      card.classList.remove('ready');
      card.classList.add('not-ready');
      card.querySelector('button').style.display = 'none';
      startCountdown(card, availableDate.getTime());
    }
  }
}
loadMeds();

function giveMedication(id) {
  const card = document.getElementById(id);
  card.classList.remove('pending');
  card.classList.add('given');
  card.querySelector('.status').textContent = 'GIVEN';
  const timestamp = new Date().toLocaleTimeString();
  card.querySelector('.time-given').textContent = 'Administered: ' + timestamp;
}

function givePRN(id, hours) {
  const card = document.getElementById(id);
  const button = card.querySelector('button');
  const now = new Date();
  const availableAgain = new Date(now.getTime() + hours * 60 * 60 * 1000);
  updateMedication(id, 'NOT READY', formatDateTime(now), formatDateTime(availableAgain));
  localStorage.setItem(id, JSON.stringify({
    lastGiven: now.getTime(),
    availableAgain: availableAgain.getTime()
  }));
  card.classList.remove('ready');
  card.classList.add('not-ready');
  card.querySelector('.status').textContent = 'NOT READY';
  card.querySelector('.last-given').textContent = 'Last Given: ' + formatDateTime(now);
  card.querySelector('.available-again').textContent = 'Available Again: ' + formatDateTime(availableAgain);
  button.style.display = 'none';
  startCountdown(card, availableAgain.getTime());
}

function clearPRNHistory() {
  localStorage.clear();
  location.reload();
}

window.addEventListener('load', restorePRNs);
function restorePRNs() {
  const prnCards = document.querySelectorAll('[id^="prn"]');
  prnCards.forEach(function(card) {
  const storedData = localStorage.getItem(card.id);
  if (!storedData) return;
  const data = JSON.parse(storedData);
  const now = Date.now();
  const lastGiven = new Date(data.lastGiven);
  const availableAgain = new Date(data.availableAgain);
  card.querySelector('.last-given').textContent = 'Last Given: ' + lastGiven.toLocaleTimeString();
  card.querySelector('.available-again').textContent = 'Available Again: ' + availableAgain.toLocaleTimeString();
  if (now < data.availableAgain) {
    card.classList.remove('ready');
    card.classList.add('not-ready');
    card.querySelector('.status').textContent = 'NOT READY';
    const timeRemaining = data.availableAgain - now;
    setTimeout(function() {
      card.classList.remove('not-ready');
      card.classList.add('ready');
      card.querySelector('.status').textContent = 'READY';
      card.querySelector('.available-again').textContent = 'Available Again: Ready Now';
    }, timeRemaining);
  } else {
    card.classList.remove('not-ready');
    card.classList.add('ready');
    card.querySelector('.status').textContent = 'READY';
    card.querySelector('.available-again').textContent = 'Available Again: Ready Now';
  }
});
}

async function updateMedication(id, status, lastGiven, availableAgain) {
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      id: id,
      status: status,
      lastGiven: lastGiven,
      availableAgain: availableAgain
    })
  });
}

function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

function startCountdown(card, availableTime) {
  if (!availableTime || isNaN(availableTime)) return;
  if (card.countdownTimer) {
    clearInterval(card.countdownTimer);
  }
  const button = card.querySelector('button');
  const availableText = card.querySelector('.available-again');
  card.countdownTimer = setInterval(function () {
    const remaining = availableTime - Date.now();
    if (remaining <= 0) {
      clearInterval(card.countdownTimer);
      card.countdownTimer = null;
      card.classList.remove('not-ready');
      card.classList.add('ready');
      card.querySelector('.status').textContent = 'READY';
      availableText.textContent = 'Available Again: Ready Now';
      if (button) button.style.display = 'inline-block';
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    availableText.textContent = `Available Again: ${hrs}h ${mins}m ${secs}s`;
  }, 1000);
}

setInterval(loadMeds, 30000);
