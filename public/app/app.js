// Configuration generale de l'application.
const DEFAULT_CONFIG = {
    API_BASE: "/api",
    PRACTITIONERS_DATA_URL:
        "https://data.issy.com/api/explore/v2.1/catalog/datasets/medecins-generalistes-et-infirmiers/records?limit=100",
    DEMO_FALLBACK: false,
    MAP_CENTER: { lat: 48.823, lng: 2.268 },
    MAP_ZOOM: 13,
    WORKDAY_START: "08:00",
    WORKDAY_END: "18:00",
    SLOT_MINUTES: 20,
};

const CONFIG = { ...DEFAULT_CONFIG, ...(window.APP_CONFIG || {}) };

// Routes API utilisees dans l'application.
const API = {
    login: "/auth/login",
    register: "/auth/register",
    me: "/patients/me",
    appointments: "/appointments",
    appointment(id) {
        return `/appointments/${id}`;
    },
    slots(id, date) {
        return `/practitioners/${id}/slots?date=${date}`;
    },
};

// Etat global de l'application.
const state = {
    map: null,
    markers: [],
    practitioners: [],
    appointments: [],
    patient: null,
    selectedPractitionerId: "",
};

// Pages disponibles dans l'interface.
const pages = {
    map: document.getElementById("page-map"),
    login: document.getElementById("page-login"),
    register: document.getElementById("page-register"),
    profile: document.getElementById("page-profile"),
    book: document.getElementById("page-book"),
};

// Raccourcis vers les elements HTML.
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logoutBtn");
const poiList = document.getElementById("poiList");
const refreshMapBtn = document.getElementById("refreshMap");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const profileSummary = document.getElementById("profileSummary");
const appointmentsEl = document.getElementById("appointments");
const refreshAppointmentsBtn = document.getElementById("refreshAppointments");
const updateForm = document.getElementById("updateForm");
const updateAppointmentId = document.getElementById("updateAppointmentId");
const updateDate = document.getElementById("updateDate");
const updateTime = document.getElementById("updateTime");
const bookingForm = document.getElementById("bookingForm");
const practitionerSelect = document.getElementById("practitionerSelect");
const bookingDate = document.getElementById("bookingDate");
const bookingTime = document.getElementById("bookingTime");
const slotGrid = document.getElementById("slotGrid");
const practitionerDetails = document.getElementById("practitionerDetails");
const refreshSlotsBtn = document.getElementById("refreshSlots");

// Couleurs des messages affiches a l'utilisateur.
const STATUS_COLORS = {
    info: { background: "#fff7e6", color: "#5c3b09" },
    success: { background: "#e6f7f0", color: "#0c6b52" },
    error: { background: "#ffe7e6", color: "#7a1f1b" },
};

// Affiche un message temporaire en haut de l'ecran.
function showStatus(message, type) {
    const statusType = type || "info";
    const colors = STATUS_COLORS[statusType] || STATUS_COLORS.info;

    statusEl.textContent = message;
    statusEl.dataset.type = statusType;
    statusEl.classList.add("show");
    statusEl.style.background = colors.background;
    statusEl.style.color = colors.color;

    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(function () {
        statusEl.classList.remove("show");
    }, 5000);
}

// Enregistre le token de connexion dans un cookie.
function setAuthToken(token) {
    if (!token) {
        return;
    }

    document.cookie = `auth_token=${encodeURIComponent(token)};path=/;SameSite=Lax`;
}

// Lit le token de connexion dans le cookie.
function getAuthToken() {
    const match = document.cookie.match(/(?:^|;)\s*auth_token=([^;]*)/);

    if (!match) {
        return "";
    }

    return decodeURIComponent(match[1]);
}

// Supprime le token de connexion.
function clearAuthToken() {
    document.cookie = "auth_token=;Max-Age=0;path=/;SameSite=Lax";
}

// Renvoie la premiere valeur trouvee dans un objet.
function getFirstValue(object, keys, fallback) {
    if (!object) {
        return fallback;
    }

    for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];

        if (object[key] !== undefined && object[key] !== null) {
            return object[key];
        }
    }

    return fallback;
}

// Recupere les informations du patient dans la reponse API.
function getPatientFromResponse(data) {
    if (!data) {
        return null;
    }

    return (
        data.user ||
        data.patient ||
        (data.data && (data.data.user || data.data.patient)) ||
        null
    );
}

// Recupere le token dans la reponse API.
function getTokenFromResponse(data) {
    if (!data) {
        return "";
    }

    return data.token || data.access_token || (data.data && data.data.token) || "";
}

// Fonction commune pour envoyer des requetes a l'API.
async function apiRequest(path, options) {
    const requestOptions = options || {};
    const headers = {
        "Content-Type": "application/json",
        ...(requestOptions.headers || {}),
    };
    const token = getAuthToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${CONFIG.API_BASE}${path}`, {
        ...requestOptions,
        headers,
    });

    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const message =
            data && typeof data === "object" && data.message
                ? data.message
                : "Erreur API";
        throw new Error(message);
    }

    return data;
}

// Cree un identifiant unique pour chaque praticien.
function buildPractitionerId(record) {
    const parts = [
        record.civilite || "",
        record.prenom || "",
        record.nom || "",
        record.adresse || "",
        record.cp || "",
        record.ville || "",
    ];

    return parts
        .join("|")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

// Transforme les donnees brutes en objet plus simple a utiliser.
function normalizePractitioner(record) {
    const cp =
        record.cp !== undefined && record.cp !== null
            ? String(Math.trunc(Number(record.cp)))
            : "";
    const cityLine = `${cp} ${record.ville || ""}`.trim();
    const addressParts = [record.adresse || "", cityLine].filter(Boolean);
    const geolocalisation = record.geolocalisation || {};

    return {
        id: buildPractitionerId(record),
        nom: record.nom || "",
        prenom: record.prenom || "",
        name:
            [record.civilite || "Dr", record.prenom || "", record.nom || ""]
                .filter(Boolean)
                .join(" ") || "Cabinet",
        speciality: record.specialite || "Médecine générale",
        adresse: addressParts.join(", ") || "Adresse non renseignée",
        commentaire: record.commentaire || "",
        phone: record.telephone || "Téléphone non renseigné",
        lat:
            geolocalisation.lat !== undefined ? geolocalisation.lat : null,
        lng:
            geolocalisation.lon !== undefined ? geolocalisation.lon : null,
    };
}

// Charge les praticiens depuis l'API externe.
async function fetchPractitioners() {
    const response = await fetch(CONFIG.PRACTITIONERS_DATA_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error("Impossible de charger les praticiens.");
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    return results.map(normalizePractitioner).filter(function (practitioner) {
        return practitioner.id;
    });
}

// Liste de secours si le mode demo est active.
function demoPractitioners() {
    return [
        {
            id: "demo-1",
            nom: "Martin",
            prenom: "Claire",
            name: "Dr Claire Martin",
            speciality: "Médecine générale",
            adresse: "12 rue Horace Vernet, 92130 Issy-les-Moulineaux",
            commentaire: "",
            phone: "01 40 00 00 01",
            lat: 48.824,
            lng: 2.27,
        },
        {
            id: "demo-2",
            nom: "Dupont",
            prenom: "Lucas",
            name: "Infirmier Lucas Dupont",
            speciality: "Infirmier",
            adresse: "20 avenue Victor Cresson, 92130 Issy-les-Moulineaux",
            commentaire: "",
            phone: "01 40 00 00 02",
            lat: 48.821,
            lng: 2.265,
        },
    ];
}

// Recherche un praticien dans la liste a partir de son id.
function findPractitionerById(id) {
    const wantedId =
        id !== undefined && id !== null ? String(id) : state.selectedPractitionerId;

    for (let i = 0; i < state.practitioners.length; i += 1) {
        const practitioner = state.practitioners[i];

        if (String(practitioner.id) === String(wantedId)) {
            return practitioner;
        }
    }

    return null;
}

// Supprime les anciens marqueurs de la carte.
function clearMarkers() {
    for (let i = 0; i < state.markers.length; i += 1) {
        state.markers[i].remove();
    }

    state.markers = [];
}

// Initialise la carte une seule fois.
function initMap() {
    if (state.map) {
        return;
    }

    state.map = L.map("map").setView(
        [CONFIG.MAP_CENTER.lat, CONFIG.MAP_CENTER.lng],
        CONFIG.MAP_ZOOM,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(state.map);

    if (!navigator.geolocation) {
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            state.map.setView(
                [position.coords.latitude, position.coords.longitude],
                13,
            );
        },
        function () {},
    );
}

// Met a jour le bloc d'informations du praticien choisi.
function updatePractitionerDetails() {
    const practitioner = findPractitionerById(practitionerSelect.value);

    if (!practitioner) {
        practitionerDetails.textContent =
            "Sélectionnez un praticien pour voir ses informations.";
        return;
    }

    practitionerDetails.innerHTML = `
    <p><strong>${practitioner.name || "Cabinet"}</strong></p>
    <p>${practitioner.speciality || "Médecine générale"}</p>
    <p>${practitioner.adresse || "Adresse non renseignée"}</p>
    <p>${practitioner.phone || "Téléphone non renseigné"}</p>
  `;
}

// Synchronise la selection visuelle avec l'etat de l'application.
function syncPractitionerSelection() {
    const practitioner = findPractitionerById();

    if (!state.selectedPractitionerId || !practitioner) {
        state.selectedPractitionerId = "";
        practitionerSelect.value = "";
        updatePractitionerDetails();
        return;
    }

    practitionerSelect.value = String(practitioner.id);
    updatePractitionerDetails();
}

// Enregistre le praticien choisi et prepare la reservation.
function selectPractitioner(practitioner, options) {
    const settings = options || {};

    if (!practitioner) {
        return;
    }

    state.selectedPractitionerId = String(practitioner.id);
    bookingTime.value = "";

    if (
        settings.centerMap !== false &&
        state.map &&
        practitioner.lat &&
        practitioner.lng
    ) {
        state.map.setView([practitioner.lat, practitioner.lng], 14);
    }

    syncPractitionerSelection();

    if (settings.navigateToBook) {
        window.location.hash = "#book";
    } else {
        loadSlots();
    }

    showStatus(
        "Praticien sélectionné. Vous pouvez réserver un créneau.",
        "success",
    );
}

// Remplit la liste deroulante des praticiens.
function renderPractitionerSelect() {
    practitionerSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choisir un praticien";
    practitionerSelect.appendChild(placeholder);

    for (let i = 0; i < state.practitioners.length; i += 1) {
        const practitioner = state.practitioners[i];
        const option = document.createElement("option");

        option.value = practitioner.id;
        option.textContent = practitioner.name || `Praticien #${practitioner.id}`;
        practitionerSelect.appendChild(option);
    }

    syncPractitionerSelection();
}

// Affiche la liste des praticiens et leurs marqueurs sur la carte.
function renderPractitioners() {
    poiList.innerHTML = "";
    clearMarkers();

    for (let i = 0; i < state.practitioners.length; i += 1) {
        const practitioner = state.practitioners[i];
        const item = document.createElement("div");

        item.className = "poi";
        item.innerHTML = `
        <h4>${practitioner.name || "Cabinet"}</h4>
        <p>${practitioner.adresse || "Adresse non renseignée"}</p>
    `;

        item.addEventListener("click", function () {
            selectPractitioner(practitioner, { navigateToBook: true });
        });

        poiList.appendChild(item);

        if (state.map && practitioner.lat && practitioner.lng) {
            const marker = L.marker([practitioner.lat, practitioner.lng])
                .addTo(state.map)
                .bindPopup(
                    `<strong>${practitioner.name || "Cabinet"}</strong><br>${practitioner.adresse || ""}`,
                );

            marker.on("click", function () {
                selectPractitioner(practitioner, { navigateToBook: true });
            });

            state.markers.push(marker);
        }
    }

    renderPractitionerSelect();
}

// Charge les praticiens puis les affiche.
async function loadPractitioners() {
    try {
        state.practitioners = await fetchPractitioners();

        if (!state.practitioners.length && CONFIG.DEMO_FALLBACK) {
            state.practitioners = demoPractitioners();
        }

        renderPractitioners();

        if (state.selectedPractitionerId) {
            loadSlots();
        }
    } catch (error) {
        if (CONFIG.DEMO_FALLBACK) {
            state.practitioners = demoPractitioners();
            renderPractitioners();

            if (state.selectedPractitionerId) {
                loadSlots();
            }

            showStatus("API indisponible, mode démo actif.", "info");
            return;
        }

        showStatus(error.message, "error");
    }
}

// Fonction commune pour la connexion et l'inscription.
async function submitAuthForm(event, form, path, successMessage) {
    event.preventDefault();

    try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const data = await apiRequest(path, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        const token = getTokenFromResponse(data);

        if (token) {
            setAuthToken(token);
        }

        state.patient = getPatientFromResponse(data);
        showStatus(successMessage, "success");
        window.location.hash = "#profile";
    } catch (error) {
        showStatus(error.message, "error");
    }
}

// Gere la connexion.
async function handleLogin(event) {
    await submitAuthForm(event, loginForm, API.login, "Connexion réussie.");
}

// Gere l'inscription.
async function handleRegister(event) {
    await submitAuthForm(
        event,
        registerForm,
        API.register,
        "Inscription réussie.",
    );
}

// Construit le nom a afficher pour le patient connecte.
function getPatientDisplayName(patient) {
    if (!patient) {
        return "Patient";
    }

    const firstName = patient.prenomPatient || patient.prenom || "";
    const lastName = patient.nomPatient || patient.nom || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || patient.name || "Patient";
}

// Charge le profil du patient puis ses rendez-vous.
async function loadProfile() {
    try {
        const me = await apiRequest(API.me);

        state.patient = getFirstValue(me, ["data", "user", "patient"], me);

        const name = getPatientDisplayName(state.patient);
        const email = state.patient.loginPatient || state.patient.email || "";

        profileSummary.textContent = email ? `${name} - ${email}` : name;
    } catch (error) {
        profileSummary.textContent = "Aucun patient connecté.";
    }

    await loadAppointments();
}

// Recupere la liste des rendez-vous depuis la reponse API.
function getAppointmentsFromResponse(data) {
    const list = getFirstValue(
        data,
        ["data", "appointments", "appointment"],
        data,
    );

    return Array.isArray(list) ? list : [];
}

// Charge les rendez-vous du patient.
async function loadAppointments() {
    try {
        const data = await apiRequest(API.appointments);
        state.appointments = getAppointmentsFromResponse(data);
        renderAppointments();
    } catch (error) {
        appointmentsEl.innerHTML = `<p class="muted">${error.message}</p>`;
    }
}

// Prepare le nom du praticien a afficher pour un rendez-vous.
function getAppointmentName(appointment) {
    return (
        appointment.practitioner_name ||
        (appointment.practitioner && appointment.practitioner.name) ||
        `${appointment.prenomMedecin || ""} ${appointment.nomMedecin || ""}`.trim() ||
        "Praticien"
    );
}

// Recupere la date du rendez-vous selon le format renvoye par l'API.
function getAppointmentDate(appointment) {
    return (
        appointment.date ||
        appointment.dateHeureRdv ||
        appointment.datetime ||
        appointment.start_at
    );
}

// Affiche les rendez-vous dans la page profil.
function renderAppointments() {
    appointmentsEl.innerHTML = "";
    updateAppointmentId.innerHTML = "";

    if (!state.appointments.length) {
        appointmentsEl.innerHTML =
            '<p class="muted">Aucun rendez-vous pour le moment.</p>';
        return;
    }

    for (let i = 0; i < state.appointments.length; i += 1) {
        const appointment = state.appointments[i];
        const id = appointment.id || appointment.idRdv;
        const name = getAppointmentName(appointment);
        const dateValue = getAppointmentDate(appointment);
        const wrapper = document.createElement("div");
        const option = document.createElement("option");

        wrapper.className = "appointment";
        wrapper.innerHTML = `
        <div>
            <h4>${name}</h4>
            <small>${formatDateTime(dateValue)} - ${appointment.duration_minutes || 20} min</small>
        </div>
        <button class="ghost" data-id="${id}">Annuler</button>
    `;

        wrapper.querySelector("button").addEventListener("click", function () {
            cancelAppointment(id);
        });

        option.value = id;
        option.textContent = `${formatDateTime(dateValue)} - ${name}`;

        appointmentsEl.appendChild(wrapper);
        updateAppointmentId.appendChild(option);
    }
}

// Supprime un rendez-vous.
async function cancelAppointment(id) {
    if (!id) {
        return;
    }

    try {
        await apiRequest(API.appointment(id), { method: "DELETE" });
        showStatus("Rendez-vous annulé.", "success");
        await loadAppointments();
    } catch (error) {
        showStatus(error.message, "error");
    }
}

// Modifie la date et l'heure d'un rendez-vous.
async function updateAppointment(event) {
    event.preventDefault();

    const id = updateAppointmentId.value;

    if (!id) {
        return;
    }

    try {
        await apiRequest(API.appointment(id), {
            method: "PATCH",
            body: JSON.stringify({
                date: updateDate.value,
                time: updateTime.value,
            }),
        });

        showStatus("Rendez-vous modifié.", "success");
        await loadAppointments();
    } catch (error) {
        showStatus(error.message, "error");
    }
}

// Formate une date pour un affichage lisible.
function formatDateTime(value) {
    if (!value) {
        return "Date inconnue";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// Cree des creneaux horaires simples pour le mode demo.
function buildSlots(start, end, minutes) {
    const slots = [];
    const startParts = start.split(":").map(Number);
    const endParts = end.split(":").map(Number);
    let currentMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    while (currentMinutes + minutes <= endMinutes) {
        const hours = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
        const mins = String(currentMinutes % 60).padStart(2, "0");

        slots.push({
            time: `${hours}:${mins}`,
            available: true,
        });

        currentMinutes += minutes;
    }

    return slots;
}

// Recupere les creneaux dans la reponse API.
function getSlotsFromResponse(data) {
    const list = getFirstValue(data, ["data", "slots", "slot"], data);

    return Array.isArray(list) ? list : [];
}

// Affiche les creneaux disponibles.
function renderSlots(slots) {
    slotGrid.innerHTML = "";

    if (!slots.length) {
        slotGrid.innerHTML = '<p class="muted">Aucun créneau disponible.</p>';
        return;
    }

    for (let i = 0; i < slots.length; i += 1) {
        const slot = slots[i];
        const timeValue = slot.time || slot.start || slot.start_time || slot;
        const available = slot.available !== false;
        const button = document.createElement("div");

        button.className = "slot";
        button.textContent = timeValue;

        if (!available) {
            button.classList.add("disabled");
        } else {
            button.addEventListener("click", function () {
                const allSlots = document.querySelectorAll(".slot");

                for (let j = 0; j < allSlots.length; j += 1) {
                    allSlots[j].classList.remove("active");
                }

                button.classList.add("active");
                bookingTime.value = timeValue;
            });
        }

        slotGrid.appendChild(button);
    }
}

// Charge les creneaux du praticien selectionne.
async function loadSlots() {
    const practitionerId = practitionerSelect.value;
    const date = bookingDate.value;

    if (!practitionerId || !date) {
        slotGrid.innerHTML =
            '<p class="muted">Choisissez un praticien et une date.</p>';
        return;
    }

    try {
        const data = await apiRequest(API.slots(practitionerId, date));
        renderSlots(getSlotsFromResponse(data));
    } catch (error) {
        if (CONFIG.DEMO_FALLBACK) {
            renderSlots(
                buildSlots(
                    CONFIG.WORKDAY_START,
                    CONFIG.WORKDAY_END,
                    CONFIG.SLOT_MINUTES,
                ),
            );
            showStatus("Créneaux générés en mode démo.", "info");
            return;
        }

        showStatus(error.message, "error");
    }
}

// Envoie une demande de reservation.
async function submitBooking(event) {
    event.preventDefault();

    const practitionerId = practitionerSelect.value;
    const date = bookingDate.value;
    const time = bookingTime.value;

    if (!practitionerId || !date || !time) {
        showStatus(
            "Veuillez choisir un praticien, une date et un créneau.",
            "error",
        );
        return;
    }

    const practitioner = findPractitionerById(practitionerId);

    try {
        await apiRequest(API.appointments, {
            method: "POST",
            body: JSON.stringify({
                practitioner_id: practitionerId,
                practitioner_name: practitioner ? practitioner.name : "",
                nomMedecin: practitioner ? practitioner.nom : "",
                prenomMedecin: practitioner ? practitioner.prenom : "",
                date,
                time,
            }),
        });

        showStatus("Rendez-vous réservé.", "success");
        window.location.hash = "#profile";
    } catch (error) {
        showStatus(error.message, "error");
    }
}

// Affiche la bonne page selon la route courante.
function showPage(route) {
    const pageNames = Object.keys(pages);

    for (let i = 0; i < pageNames.length; i += 1) {
        const name = pageNames[i];
        pages[name].classList.remove("active");
    }

    const currentPage = pages[route] || pages.map;
    currentPage.classList.add("active");

    const links = document.querySelectorAll(".bottom-nav a");

    for (let i = 0; i < links.length; i += 1) {
        links[i].classList.toggle("active", links[i].dataset.route === route);
    }

    if (route === "map") {
        initMap();
        loadPractitioners();
    }

    if (route === "profile") {
        loadProfile();
    }

    if (route === "book") {
        loadPractitioners();
    }
}

// Lit la route dans l'URL.
function handleRoute() {
    const route = window.location.hash.replace("#", "") || "map";
    showPage(route);
}

// Gere le changement de praticien dans la liste.
function handlePractitionerChange() {
    state.selectedPractitionerId = practitionerSelect.value;
    bookingTime.value = "";
    updatePractitionerDetails();
    loadSlots();
}

// Gere la deconnexion.
function handleLogout() {
    clearAuthToken();
    state.patient = null;
    showStatus("Déconnexion.", "success");
    window.location.hash = "#login";
}

// Initialise les dates par defaut dans les formulaires.
function initDefaultDates() {
    const today = new Date().toISOString().slice(0, 10);

    bookingDate.value = today;
    updateDate.value = today;
    updateTime.value = "09:00";
}

// Branche tous les evenements de l'interface.
function bindEvents() {
    loginForm.addEventListener("submit", handleLogin);
    registerForm.addEventListener("submit", handleRegister);
    bookingForm.addEventListener("submit", submitBooking);
    updateForm.addEventListener("submit", updateAppointment);
    refreshMapBtn.addEventListener("click", loadPractitioners);
    refreshAppointmentsBtn.addEventListener("click", loadAppointments);
    refreshSlotsBtn.addEventListener("click", loadSlots);
    practitionerSelect.addEventListener("change", handlePractitionerChange);
    bookingDate.addEventListener("change", loadSlots);
    logoutBtn.addEventListener("click", handleLogout);
    window.addEventListener("hashchange", handleRoute);
}

// Lance l'application.
function init() {
    initDefaultDates();
    bindEvents();
    handleRoute();
}

init();
