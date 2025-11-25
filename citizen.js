document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("incident-form");
  const incidentTypeEl = document.getElementById("incident-type");
  const severityEl = document.getElementById("severity");
  const descriptionEl = document.getElementById("description");
  const latEl = document.getElementById("latitude");
  const lonEl = document.getElementById("longitude");
  const autoLocBtn = document.getElementById("auto-location-btn");
  const statusText = document.getElementById("incident-status");

  autoLocBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      statusText.textContent = "Geolocation is not supported in this browser.";
      return;
    }
    statusText.textContent = "Detecting location...";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latEl.value = pos.coords.latitude.toFixed(6);
        lonEl.value = pos.coords.longitude.toFixed(6);
        statusText.textContent = "Location filled. You can edit manually if needed.";
      },
      (err) => {
        console.error(err);
        statusText.textContent = "Could not get GPS location.";
      }
    );
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusText.textContent = "Sending SOS...";

    const payload = {
      incident_type: incidentTypeEl.value,
      severity: severityEl.value,
      description: descriptionEl.value || "No description provided.",
      latitude: parseFloat(latEl.value),
      longitude: parseFloat(lonEl.value),
    };

    try {
      const created = await apiCreateIncident(payload);
      statusText.textContent = `SOS created with ID #${created.id}. Command center notified.`;
      form.reset();
    } catch (err) {
      console.error(err);
      statusText.textContent = "Error sending SOS. Check backend server.";
    }
  });
});
