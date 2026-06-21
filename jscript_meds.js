const API_URL = 'https://script.google.com/macros/s/AKfycbxtugFHePScrkam3b1hdeu869zrbiLGqpS9aGLM0klgD_CYZMPrCJXyhnBnyZC5Rxv2/exec';

async function loadMeds() {
  const response = await fetch(API_URL + '?t=' + Date.now());
  const data = await response.json();
  const now = new Date();
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    let status = String(data[i][2]).trim();
    const lastGiven = data[i][3];
    const availableAgain = data[i][4];
    const card = document.getElementById(id);
    if (!card) continue;
    const button = card.querySelector('button');
    card.querySelector('.status').textContent = status;
    card.querySelector('.last-given').textContent = 'Last Given: ' + lastGiven;
    card.querySelector('.available-again').textContent = 'Available Again: ' + availableAgain;
    if (status === 'READY') {
      card.classList.remove('not-ready');
      card.classList.add('ready');
      if (button) button.style.display = 'inline-block';
    } else {
      card.classList.remove('ready');
      card.classList.add('not-ready');
      if (button) button.style.display = 'none';
    }
  }
}

function givePRN(id, hours) {
  const card = document.getElementById(id);
  const button = card.querySelector('button');
  const now = new Date();
  const availableAgain = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const lastGivenText = formatDateTime(now);
  const availableAgainText = formatDateTime(availableAgain);
  card.classList.remove('ready');
  card.classList.add('not-ready');
  card.querySelector('.status').textContent = 'NOT READY';
  card.querySelector('.last-given').textContent = 'Last Given: ' + lastGivenText;
  card.querySelector('.available-again').textContent = 'Available Again: ' + availableAgainText;
  if (button) button.style.display = 'none';
  updateMedication(id, 'NOT READY', lastGivenText, availableAgainText);
}

async function updateMedication(id, status, lastGiven, availableAgain) {
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      id,
      status,
      lastGiven,
      availableAgain
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

loadMeds();
setInterval(loadMeds, 5000);
