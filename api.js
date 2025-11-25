const API_BASE_URL = "http://127.0.0.1:8000";

async function apiCreateIncident(payload) {
  const res = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to create incident");
  }
  return res.json();
}

async function apiListIncidents() {
  const res = await fetch(`${API_BASE_URL}/incidents`);
  if (!res.ok) {
    throw new Error("Failed to fetch incidents");
  }
  return res.json();
}

async function apiUpdateIncidentStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error("Failed to update status");
  }
  return res.json();
}

async function apiAutoRecommendation(id) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/auto_recommendation`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to generate recommendation");
  }
  return res.json();
}

async function apiListRecommendations(id) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/recommendations`);
  if (!res.ok) {
    throw new Error("Failed to fetch recommendations");
  }
  return res.json();
}
