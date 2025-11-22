// =======================================================
// CONFIGURARE ȘI CONSTANTE
// =======================================================
const API_URL = "http://127.0.0.1:5000/api/predict";
const PRIMARY_COLOR = "#7B1F45";

// Obținem referințele la elementele HTML
const analyzeButton = document.getElementById("analyzeBtn");
const imageInput = document.getElementById("imageInput");
const resultContainer = document.getElementById("finalAnalysisResultContainer");
const fileStatusDisplay = document.getElementById("fileStatusDisplay");
const chooseFileBtn = document.getElementById("chooseFileBtn"); // Butonul "Alege Fișier"

// =======================================================
// LOGICA PENTRU ÎNCĂRCAREA FIȘIERULUI
// =======================================================
imageInput.addEventListener("change", (event) => {
  // Curățăm rezultatul anterior
  resultContainer.innerHTML = " ";

  if (imageInput.files.length > 0) {
    const fileName = imageInput.files[0].name;

    // 1. Afișăm confirmarea
    fileStatusDisplay.innerHTML = `✅ Imagine încărcată: ${fileName}`;
    fileStatusDisplay.style.color = PRIMARY_COLOR;

    // 2. ASCUNDEM BUTONUL DE "ALEGE FIȘIER" (Cerința ta)
    if (chooseFileBtn) chooseFileBtn.style.display = "none";

    // 3. Activăm butonul de analiză
    analyzeButton.disabled = false;
  } else {
    fileStatusDisplay.textContent = "Nicio imagine selectată.";
    fileStatusDisplay.style.color = "#999";
    analyzeButton.disabled = true;
    // Dacă dă cancel, arătăm butonul înapoi
    if (chooseFileBtn) chooseFileBtn.style.display = "inline-block";
  }
});

// =======================================================
// LOGICA DE ANALIZĂ AI
// =======================================================
analyzeButton.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) return;

  // UI Updates
  analyzeButton.textContent = "Se analizează... ⏳";
  analyzeButton.disabled = true;
  resultContainer.textContent = "Se trimite la AI...";
  fileStatusDisplay.textContent = "";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // ============================================================
      // LOGICA COMPLEXĂ DE AFIȘARE (Cerințele Tale)
      // ============================================================

      const top1 = data.top_results[0]; // Cel mai probabil rezultat
      const top2 = data.top_results[1]; // Al doilea cel mai probabil

      const prob1Raw = top1.probability;
      const prob1Percent = (prob1Raw * 100).toFixed(2);

      let finalHTML = "";
      let warningMessage = "";
      let needsDoctor = false;

      // 1. VERIFICARE INCERTITUDINE (< 80%)
      if (prob1Raw < 0.8) {
        const prob2Percent = (top2.probability * 100).toFixed(2);

        finalHTML = `
            ⚠️ **Rezultat Incert (AI < 80%)**<br>
            1. ${top1.name}: <strong>${prob1Percent}%</strong><br>
            2. ${top2.name}: <strong>${prob2Percent}%</strong>
        `;
        // Recomandăm doctorul implicit dacă AI-ul nu e sigur
        needsDoctor = true;
      } else {
        // Caz standard: AI e sigur > 80%
        finalHTML = `✅ **Diagnostic Probabil:** ${top1.name} (${prob1Percent}%)`;
      }

      // 2. VERIFICARE PERICOL (bcc, bkl, mel > 40%)
      // Lista bolilor periculoase (excludem 'nv')
      const dangerousConditions = ["bcc", "bkl", "mel"];

      if (dangerousConditions.includes(top1.code) && prob1Raw > 0.4) {
        needsDoctor = true;
        warningMessage = `
            <div style="margin-top:15px; padding:10px; border: 2px solid #d9534f; background-color: #f9d6d5; color: #a94442; border-radius: 5px;">
                🚨 <strong>RECOMANDARE MEDICALĂ:</strong><br>
                AI-ul a detectat o probabilitate de <strong>${prob1Percent}%</strong> pentru <strong>${top1.code.toUpperCase()}</strong>.
                <br>Vă recomandăm urgent o vizită la medicul dermatolog pentru investigații suplimentare.
            </div>
        `;
      } else if (needsDoctor && !warningMessage) {
        // Mesaj generic de doctor (pentru cazul <80% dar fără boală gravă detectată clar)
        warningMessage = `
            <div style="margin-top:15px; color: var(--primary-dark);">
                ℹ️ Vă recomandăm o vizită la medic pentru confirmarea diagnosticului.
            </div>
        `;
      } else if (top1.code === "nv") {
        warningMessage = `
            <div style="margin-top:15px; color: green;">
                😊 Nev benign (Aluniță). Nu prezintă risc imediat, dar monitorizați evoluția.
            </div>
        `;
      }

      // Asamblăm rezultatul final
      resultContainer.innerHTML = finalHTML + warningMessage;
      resultContainer.style.color = PRIMARY_COLOR;

      // 3. REAFIȘĂM BUTONUL "ALEGE FIȘIER" (Cerința ta: apare doar după rezultat)
      if (chooseFileBtn) {
        chooseFileBtn.style.display = "inline-block";
        chooseFileBtn.textContent = "Alege alt fișier"; // Opțional: schimbăm textul
      }
    } else {
      resultContainer.textContent = `❌ Eroare: ${data.message}`;
      resultContainer.style.color = "red";
      if (chooseFileBtn) chooseFileBtn.style.display = "inline-block";
    }
  } catch (error) {
    console.error(error);
    resultContainer.textContent = "🚨 Eroare conexiune server.";
    resultContainer.style.color = "red";
    if (chooseFileBtn) chooseFileBtn.style.display = "inline-block";
  } finally {
    analyzeButton.textContent = "Analizează Acum";
    // Opțional: Dezactivăm butonul de analiză până se alege alt fișier
    analyzeButton.disabled = true;
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
if (listContainer) {
  clinici.forEach((clinic) => {
    // 1. Link-ul către Google Maps folosind adresa (textul este mai fiabil)
    const mapSearchQuery = encodeURIComponent(
      clinic.nume + ", " + clinic.adresa + ", Cluj-Napoca"
    );
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

    // Marker pe hartă
    L.marker([clinic.lat, clinic.lng], { icon: doctorIcon })
      .addTo(map)
      .bindPopup(
        `<b>${clinic.nume}</b><br>${clinic.adresa}<br><a href="${mapLink}" target="_blank" style="color:var(--primary-color); font-weight:bold;">Vezi pe Hartă</a>`
      );

    // Item în listă
    const li = document.createElement("li");
    li.className = "clinic-item";
    li.innerHTML = `
            <h3 style="font-size:1.1rem; margin-bottom:5px;">${clinic.nume}</h3>
            <p style="margin-bottom:10px;">${clinic.adresa}</p>
            <span style="color:var(--primary-color); font-weight:bold;">${clinic.dist}</span>
            <a href="${mapLink}" target="_blank" class="btn btn-map">Vezi pe Hartă</a>
        `;
    listContainer.appendChild(li);
  });
}
