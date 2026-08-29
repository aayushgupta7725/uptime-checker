const API = 'http://localhost:3000';

async function loadUrls() {
  const response = await fetch(`${API}/urls`);
  const urls = await response.json();

  const urlList = document.getElementById('urlList');

  if (urls.length === 0) {
    urlList.innerHTML = '<p>No URLs being monitored yet.</p>';
    return;
  }

  urlList.innerHTML = '';

  for (const url of urls) {
    const checksResponse = await fetch(`${API}/urls/${url.id}/checks`);
    const checks = await checksResponse.json();
    const latestCheck = checks[0];

    const status = latestCheck ? latestCheck.status : 'unknown';
    const responseTime = latestCheck ? `${latestCheck.response_time}ms` : 'N/A';

    const card = document.createElement('div');
    card.className = 'url-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div>
        <strong>${url.url}</strong>
        <p style="color:#999; font-size:12px;">Every ${url.interval} min | Last response: ${responseTime}</p>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <span class="status ${status}">${status.toUpperCase()}</span>
        <button class="delete-btn" onclick="deleteUrl(${url.id}); event.stopPropagation();">Delete</button>
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `history.html?id=${url.id}&url=${encodeURIComponent(url.url)}`;
    });

    urlList.appendChild(card);
  }
}

async function addUrl() {
  const url = document.getElementById('urlInput').value.trim();
  const interval = document.getElementById('intervalSelect').value;

  if (!url) {
    alert('Please enter a URL');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
  alert('Please enter a valid URL starting with http:// or https://');
  return; 
  }

  const response = await fetch(`${API}/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, interval: parseInt(interval) })
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error);
    return;
  }

  document.getElementById('urlInput').value = '';
  loadUrls();
}

async function deleteUrl(id) {
  await fetch(`${API}/urls/${id}`, { method: 'DELETE' });
  loadUrls();
}

document.getElementById('addButton').addEventListener('click', addUrl);

loadUrls();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadUrls();
  }
});