// --- GLOBAL CENTRAL APP STATE MATRIX (Using LocalStorage) ---
let appEvents = JSON.parse(localStorage.getItem('et_v3_events')) || [
    { id: 1, title: 'Tech Summit 2024', category: 'Conference', sold: 342, capacity: 500 },
    { id: 2, title: 'Acoustic Harmonics', category: 'Music/Concert', sold: 120, capacity: 200 },
    { id: 3, title: 'B2B Capital Mixer', category: 'Networking', sold: 85, capacity: 100 }
];

let appAttendees = JSON.parse(localStorage.getItem('et_v3_attendees')) || [
    { id: 10, name: 'Alexandra Daddario', target: 'Tech Summit 2024', status: 'CONFIRMED', time: '2 mins ago' },
    { id: 11, name: 'Edwin Adenike', target: 'Acoustic Harmonics', status: 'PENDING', time: '14 mins ago' },
    { id: 12, name: 'Isaac Oluwa', target: 'B2B Capital Mixer', status: 'CONFIRMED', time: '1 hr ago' },
    { id: 13, name: 'Sophia Martinez', target: 'Tech Summit 2024', status: 'CONFIRMED', time: '3 hrs ago' }
];

// Global Chart References
let chartDash, chartCat, chartPipe;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderWorkspaceDOM();
    initializeGlobalChartFrameworks();
});

// --- SINGLE PAGE VIEW TRANSITION PIPELINES ---
function navigateTo(targetId) {
    document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(targetId).classList.add('active');
    const targetLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    if(targetLink) targetLink.classList.add('active');
}

// Bind clicks to sidebar links
document.querySelectorAll('.nav-link[data-target]').forEach(link => {
    link.addEventListener('click', () => navigateTo(link.getAttribute('data-target')));
});

// Dropdown Logic
function toggleAccountMenu(e) { 
    e.stopPropagation(); 
    document.getElementById('accountMenu').classList.toggle('show'); 
}
document.addEventListener('click', () => document.getElementById('accountMenu').classList.remove('show'));

// --- DOM RENDERING (UPDATING HTML WITH DATA) ---
function renderWorkspaceDOM() {
    // Top Dashboard Stats
    document.getElementById('dashEventCount').innerText = appEvents.length;
    let combinedTickets = appEvents.reduce((acc, current) => acc + current.sold, 0);
    document.getElementById('dashTicketCount').innerText = combinedTickets.toLocaleString();

    // Event Grid Cards
    const grid = document.getElementById('eventsContainerGrid');
    grid.innerHTML = appEvents.map(ev => {
        let ratio = Math.round((ev.sold / ev.capacity) * 100);
        return `
            <div class="event-workspace-card searchable-item">
                <div>
                    <span class="event-meta-tag">${ev.category}</span>
                    <h3 style="margin-bottom:6px;">${ev.title}</h3>
                    <p style="color:var(--text-gray); font-size:0.85rem;">Capacity Matrix Status:</p>
                    <div class="capacity-bar-bg"><div class="capacity-bar-fill" style="width: ${ratio}%;"></div></div>
                    <span style="font-size:0.9rem; font-weight:700;">${ev.sold}</span> / <span style="color:var(--text-gray); font-size:0.85rem;">${ev.capacity} Allocated</span>
                </div>
                <div style="margin-top:20px; display:flex; justify-content:space-between;">
                    <button class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="purgeEventInstance(${ev.id})">Decommission</button>
                </div>
            </div>
        `;
    }).join('');

    renderAttendeesTable();
}

function renderAttendeesTable() {
    const currentFilter = document.getElementById('statusFilter').value;
    const tableBody = document.getElementById('attendeeTableBody');
    
    let dataset = appAttendees.filter(item => currentFilter === 'ALL' || item.status === currentFilter);

    tableBody.innerHTML = dataset.map(att => `
        <tr class="searchable-item">
            <td style="font-weight:700;">${att.name}</td>
            <td>${att.target}</td>
            <td><span class="status-badge ${att.status.toLowerCase()}">${att.status}</span></td>
            <td style="color:var(--text-gray); font-size:0.9rem;">${att.time}</td>
            <td>
                ${att.status === 'PENDING' ? 
                  `<button class="btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="processCheckIn(${att.id})">Approve Verification</button>` : 
                  `<i class="fa-solid fa-circle-check" style="color:var(--primary); margin-left:20px;"></i>`
                }
            </td>
        </tr>
    `).join('');
}

// --- USER ACTIONS & DATA MODIFICATION ---
function toggleModal(show) { 
    document.getElementById('eventModal').classList.toggle('show', show); 
}

function executeEventCreation() {
    const title = document.getElementById('inputEventTitle').value.trim();
    const category = document.getElementById('inputEventCategory').value;
    const capacity = parseInt(document.getElementById('inputEventCapacity').value) || 500;

    if(!title) return alert('Please provide an Event Name.');

    // Save to State and LocalStorage
    appEvents.push({ id: Date.now(), title, category, sold: 0, capacity });
    localStorage.setItem('et_v3_events', JSON.stringify(appEvents));

    // Reset UI
    document.getElementById('inputEventTitle').value = '';
    toggleModal(false);
    renderWorkspaceDOM();
    updateChartTelem();
}

function purgeEventInstance(id) {
    appEvents = appEvents.filter(ev => ev.id !== id);
    localStorage.setItem('et_v3_events', JSON.stringify(appEvents));
    renderWorkspaceDOM();
    updateChartTelem();
}

function processCheckIn(id) {
    appAttendees = appAttendees.map(att => att.id === id ? { ...att, status: 'CONFIRMED', time: 'Just Now' } : att);
    localStorage.setItem('et_v3_attendees', JSON.stringify(appAttendees));
    renderWorkspaceDOM();
}

// --- UTILITIES ---
function handleGlobalSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.searchable-item').forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(query) ? "" : "none";
    });
}

function toggleSystemTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle');
    icon.className = document.body.classList.contains('dark-theme') ? "fa-solid fa-sun theme-toggle" : "fa-solid fa-moon theme-toggle";
}

function simulateLogout() {
    if(confirm("Clear Local Storage and reset app?")) {
        localStorage.clear();
        window.location.reload();
    }
}

// --- CHART.JS CONFIGURATION ---
function initializeGlobalChartFrameworks() {
    const dashCtx = document.getElementById('miniDashboardChart').getContext('2d');
    chartDash = new Chart(dashCtx, {
        type: 'line',
        data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], datasets: [{ data: [120, 230, 180, 430, 320, 540], borderColor: '#145c3e', tension: 0.4, fill: false }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const catCtx = document.getElementById('analyticsCategoryChart').getContext('2d');
    chartCat = new Chart(catCtx, {
        type: 'doughnut',
        data: calculateDynamicCategoryWeights(),
        options: { responsive: true }
    });

    const pipeCtx = document.getElementById('analyticsPipelineChart').getContext('2d');
    chartPipe = new Chart(pipeCtx, {
        type: 'bar',
        data: { labels: ['Organic', 'Referrals', 'Social', 'Direct'], datasets: [{ data: [420, 310, 540, 210], backgroundColor: ['#145c3e', '#228b22', '#34d399', '#64748b'] }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function calculateDynamicCategoryWeights() {
    let counters = { 'Conference': 0, 'Music/Concert': 0, 'Networking': 0 };
    appEvents.forEach(ev => { if(counters[ev.category] !== undefined) counters[ev.category] += ev.sold; });
    return {
        labels: Object.keys(counters),
        datasets: [{ data: Object.values(counters), backgroundColor: ['#145c3e', '#228b22', '#0284c7'] }]
    };
}

function updateChartTelem() {
    if(chartCat) {
        chartCat.data = calculateDynamicCategoryWeights();
        chartCat.update();
    }
}