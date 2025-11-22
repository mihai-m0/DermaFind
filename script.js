// =======================================================
// CONFIGURARE ȘI CONSTANTE
// =======================================================
const API_URL = "http://127.0.0.1:5000/api/predict";
const PRIMARY_COLOR = "#7B1F45";

// 1. Obținem referințele la elementele HTML (Numele Inconfundabile)
const analyzeButton = document.getElementById("analyzeBtn");
const imageInput = document.getElementById("imageInput");

// NOUA DENUMIRE INCONFUNDABILĂ:
let resultContainer = document.getElementById("finalAnalysisResultContainer");

const fileStatusDisplay = document.getElementById("fileStatusDisplay");

// =======================================================
// LOGICA PENTRU CONFIRMAREA ȘI CURĂȚAREA FIȘIERULUI
// =======================================================
imageInput.addEventListener("change", (event) => {
  const fileName = event.target.files[0].name;
  console.log(fileName);
  // FIX: CURĂȚĂ REZULTATUL ANTERIOR IMEDIAT CÂND SE ALEGE UN FIȘIER NOU
  resultContainer.innerHTML = " "; // Folosim noua referință
  resultContainer.style.color = PRIMARY_COLOR; // Resetăm culoarea

  if (imageInput.files.length > 0) {
    const fileName = imageInput.files[0].name;

    // Afișăm mesajul de confirmare a încărcării
    fileStatusDisplay.innerHTML = `✅ **Imagine încărcată:** ${fileName}`;
    fileStatusDisplay.style.color = PRIMARY_COLOR;

    // Activăm butonul
    analyzeButton.disabled = false;
  } else {
    // Dacă nu s-a selectat nimic
    fileStatusDisplay.textContent = "Nicio imagine selectată.";
    fileStatusDisplay.style.color = "#999";
    analyzeButton.disabled = true;
  }
});

// =======================================================
// LOGICA PENTRU TRIMITEREA LA API (Click pe Buton)
// =======================================================
analyzeButton.addEventListener("click", async () => {
  resultContainer.innerHTML = " ";
  const file = imageInput.files[0];

  if (!file) {
    resultContainer.textContent =
      "❌ Vă rog selectați o imagine pentru analiză.";
    resultContainer.style.color = "red";
    return;
  }
  // Indicator de încărcare și dezactivare buton
  analyzeButton.textContent = "Se analizează... ⏳";
  analyzeButton.disabled = true;
  resultContainer.textContent = "Se trimite la AI..."; // Acest mesaj suprascrie orice rezultat vechi
  fileStatusDisplay.textContent = ""; // Curățăm statusul de încărcare

  // Creare FormData (împachetarea pozei)
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Trimiterea cererii POST către API-ul Python
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Răspuns de succes de la server

      // === CORECTARE CRITICĂ AICI: FOLOSIM 'probability_raw' (float) în loc de 'probability' (string) ===
      const confidenceRaw = data.probability_raw;
      const probabilityPercent = (confidenceRaw * 100).toFixed(2); // Calculăm procentul din valoarea float [0, 1]
      // =================================================================================================

      resultContainer.innerHTML = `
                    ✅ **Diagnostic Probabil:** ${data.condition} 
                    <br> **Confidență AI:** ${probabilityPercent}%
                `;
      resultContainer.style.color = PRIMARY_COLOR;
    } else {
      // Răspuns de eroare de la server
      resultContainer.textContent = `❌ Eroare la analiză: ${
        data.message || "Răspuns invalid."
      }`;
      resultContainer.style.color = "red";
    }
  } catch (error) {
    // Eroare de rețea
    console.error("Eroare la conexiunea cu serverul AI:", error);
    resultContainer.textContent =
      "🚨 Eroare de conexiune. Asigurați-vă că serverul Python rulează la 127.0.0.1:5000.";
    resultContainer.style.color = "red";
  } finally {
    // Restabilim butonul
    analyzeButton.textContent = "Analizează Acum";
    analyzeButton.disabled = false;
  }
});

// Dezactivăm butonul la început
analyzeButton.disabled = true;
console.log(resultContainer);
async function sendImageToAI(imageFile) {
  // 1. Prepare the data (The Envelope)
  const formData = new FormData();
  formData.append("image", imageFile);

  // 2. Send the POST Request (The Action)
  const response = await fetch("http://127.0.0.1:5000/predict", {
    method: "POST", // <--- THIS IS THE METHOD
    body: formData,
  });

  // 3. Get the Answer
  const result = await response.json();
}

// Funcție pentru hartă și carusel (pentru a preveni erorile Leaflet și a rula scroll-ul)
function scrollCarousel(id, direction) {
  const container = document.getElementById(id);
  const scrollAmount = 300; // Câți pixeli să se miște
  container.scrollLeft += direction * scrollAmount;
}

function scrollCarousel(id, direction) {
  const container = document.getElementById(id);
  const cardElement = container.querySelector(".card");

  // Verificăm dacă există cardElement pentru a calcula lățimea
  if (!cardElement) return;

  const cardWidth = cardElement.offsetWidth;
  const gap = 20; // Definită în CSS
  const scrollAmount = cardWidth + gap;

  if (direction > 0) {
    // Săgeata Dreapta (NEXT)
    // Verificăm dacă suntem aproape de sfârșit
    if (
      container.scrollLeft + container.clientWidth >=
      container.scrollWidth - 5
    ) {
      // Sărim instant la început (Loop)
      container.scrollLeft = 0;
    } else {
      // Derulare normală
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  } else {
    // Săgeata Stânga (PREVIOUS)
    // Verificăm dacă suntem la început
    if (container.scrollLeft <= 5) {
      // Sărim instant la sfârșit (Loop)
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    } else {
      // Derulare normală
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  }
}

// --- 2. LOGICA PENTRU HARTĂ (Codul discutat anterior) ---
const myLat = 46.77933;
const myLng = 23.60604;

const map = L.map("map").setView([myLat, myLng], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

// Iconițe
const userIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const doctorIcon = L.icon({
  // Am schimbat markerii din roșu în purpuriu/violet pentru a se asorta cu burgundy
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Marker User
L.marker([myLat, myLng], { icon: userIcon })
  .addTo(map)
  .bindPopup("<b>Locația Ta</b><br>Str. Henri Barbusse 44");

// Date Clinici
const clinici = [
  {
    nume: "Dermatologie Napoca",
    lat: 46.776,
    lng: 23.6057,
    adresa: "Bd. 21 Decembrie 1989",
    dist: "400 m",
  },
  {
    nume: "Regina Maria - Policlinica",
    lat: 46.7725,
    lng: 23.5998,
    adresa: "Calea Dorobanților",
    dist: "1.2 km",
  },
  {
    nume: "Clinica Medstar",
    lat: 46.781,
    lng: 23.615,
    adresa: "Strada Fabricii",
    dist: "800 m",
  },
];

const listContainer = document.getElementById("clinicList");

clinici.forEach((clinic) => {
  // Marker pe hartă
  L.marker([clinic.lat, clinic.lng], { icon: doctorIcon })
    .addTo(map)
    .bindPopup(`<b>${clinic.nume}</b><br>${clinic.adresa}`);

  // Item în listă
  const li = document.createElement("li");
  li.className = "clinic-item";
  li.innerHTML = `
                <h3 style="font-size:1.1rem; margin-bottom:5px;">${clinic.nume}</h3>
                <p style="color:#666; font-size:0.9rem;">${clinic.adresa}</p>
                <div style="display:flex; justify-content:space-between; margin-top:10px; align-items:center;">
                    <span style="font-weight:bold; color:var(--primary-color);">${clinic.dist}</span>
                    <a href="https://maps.google.com/maps/contrib/111724309756190183605${myLat},${myLng}/${clinic.lat},${clinic.lng}" target="_blank" style="color:var(--primary-dark); font-weight:600; font-size:0.9rem;">Navighează →</a>
                </div>
            `;
  listContainer.appendChild(li);
});
