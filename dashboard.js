let map;
let incidentMarkers = {};

function initMap() {
  map = L.map("map").setView([20.5937, 78.9629], 4); // Center on India by default
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

function severityClass(sev) {
  if (!sev) return "";
  const s = sev.toLowerCase();
  if (s === "high" || s === "critical") return "badge-severity-high";
  if (s === "medium") return "badge-severity-medium";
  if (s === "low") return "badge-severity-low";
  return "";
}

function statusClass(status) {
  if (!status) return "";
  const s = status.toLowerCase();
  if (s === "resolved") return "badge-status-resolved";
  if (s === "dispatched") return "badge-status-dispatched";
  return "badge-status-pending";
}

function renderIncidentsTable(incidents) {
  const tbody = document.querySelector("#incidents-table tbody");
  tbody.innerHTML = "";

  incidents.forEach((inc) => {
    const tr = document.createElement("tr");

    const createdAt = new Date(inc.created_at);
    const createdStr = createdAt.toLocaleString();

    tr.innerHTML = `
      <td>${inc.id}</td>
      <td>${inc.incident_type}</td>
      <td><span class="badge ${severityClass(inc.severity)}">${inc.severity}</span></td>
      <td><span class="badge ${statusClass(inc.status)}">${inc.status}</span></td>
      <td>${createdStr}</td>
      <td>
        <button data-action="dispatch" data-id="${inc.id}">Dispatch</button>
        <button data-action="resolve" data-id="${inc.id}">Resolve</button>
        <button data-action="ai" data-id="${inc.id}">AI Recommend</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.getAttribute("data-id"), 10);
      const action = e.target.getAttribute("data-action");

      try {
        if (action === "dispatch") {
          await apiUpdateIncidentStatus(id, "dispatched");
        } else if (action === "resolve") {
          await apiUpdateIncidentStatus(id, "resolved");
        } else if (action === "ai") {
          const rec = await apiAutoRecommendation(id);
          alert("AI Recommendation:\n" + rec.message);
        }
        await loadIncidents();
      } catch (err) {
        console.error(err);
        alert("Failed to update incident.");
      }
    });
  });
}

function renderIncidentsOnMap(incidents) {
  // Clear previous markers
  Object.values(incidentMarkers).forEach((m) => m.remove());
  incidentMarkers = {};

  incidents.forEach((inc) => {
    if (inc.latitude == null || inc.longitude == null) return;
    const marker = L.marker([inc.latitude, inc.longitude])
      .addTo(map)
      .bindPopup(
        `<strong>Incident #${inc.id}</strong><br />
         Type: ${inc.incident_type}<br />
         Severity: ${inc.severity}<br />
         Status: ${inc.status}`
      );
    incidentMarkers[inc.id] = marker;
  });

  if (incidents.length > 0) {
    const latLngs = incidents
      .filter((i) => i.latitude != null && i.longitude != null)
      .map((i) => [i.latitude, i.longitude]);
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
}

async function loadIncidents() {
  try {
    const incidents = await apiListIncidents();
    renderIncidentsTable(incidents);
    renderIncidentsOnMap(incidents);
  } catch (err) {
    console.error(err);
    alert("Failed to load incidents. Is the backend running?");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadIncidents();

  const refreshBtn = document.getElementById("refresh-incidents-btn");
  refreshBtn.addEventListener("click", loadIncidents);

  // Auto-refresh every 20 seconds (optional)
  setInterval(loadIncidents, 20000);
});
