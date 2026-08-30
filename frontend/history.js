const API = '';

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const url = params.get('url');

document.getElementById('pageTitle').textContent = url;

async function loadHistory() {
  const response = await fetch(`${API}/urls/${id}/checks`);
  const checks = await response.json();

  const historyList = document.getElementById('historyList');

  if (checks.length === 0) {
    historyList.innerHTML = '<p>No checks yet.</p>';
    return;
  }

  historyList.innerHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Status</th>
          <th>Response Time</th>
        </tr>
      </thead>
      <tbody>
        ${checks.map(check => `
          <tr>
            <td>${new Date(check.checked_at + ' UTC').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
            <td><span class="status ${check.status}">${check.status.toUpperCase()}</span></td>
            <td>${check.response_time ? check.response_time + 'ms' : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

loadHistory();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadHistory();
  }
});