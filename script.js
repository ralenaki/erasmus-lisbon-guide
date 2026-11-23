const events = [
  {
    id: 1,
    title: "Alfama Walking Tour",
    category: "culture",
    date: "Thu, 17:30",
    location: "Miradouro de Santa Luzia",
    price: "Free",
    description: "Walk through Alfama with other incoming students, checking out azulejo tiles and viewpoints."
  },
{
  id: 2,
  title: "Sintra & Cabo da Roca Day Trip",
  category: "trips",
  date: "Sat, 09:00",
  location: "Rossio Station",
  price: "€15",
  description: "Group train trip to Sintra in the morning and bus out to Cabo da Roca before sunset."
},
{
  id: 3,
  title: "International Dinner & Language Exchange",
  category: "social",
  date: "Fri, 19:30",
  location: "Arroios",
  price: "Free",
  description: "Bring something simple to share, practice Portuguese or English, and meet people from other unis."
},
{
  id: 4,
  title: "Beginner Surf at Costa da Caparica",
  category: "sports",
  date: "Sun, 10:30",
  location: "Praia de São João",
  price: "€18",
  description: "2-hour group surf session across the river. Board and wetsuit are included."
},
{
  id: 5,
  title: "LX Factory & Bookshop Walk",
  category: "culture",
  date: "Wed, 16:00",
  location: "Alcântara",
  price: "Free",
  description: "Afternoon walk around LX Factory, Ler Devagar bookshop, and the local street art."
},
{
  id: 6,
  title: "Riverfront 5K Run",
  category: "sports",
  date: "Tue, 18:30",
  location: "Cais do Sodré to Belém",
  price: "Free",
  description: "Easy-pace group run along the river with a coffee stop at the end."
},
{
  id: 7,
  title: "Sunset Hangout at Adamastor",
  category: "social",
  date: "Thu, 19:00",
  location: "Miradouro de Santa Catarina",
  price: "Free",
  description: "Chill evening meetup with card games and music overlooking the bridge."
},
{
  id: 8,
  title: "Cascais Beach & Bike Afternoon",
  category: "trips",
  date: "Sun, 11:00",
  location: "Cais do Sodré Train",
  price: "€8 rental",
  description: "Take the coastal train out to Cascais, rent bikes to Boca do Inferno, and stay at the beach."
}
];

const STORAGE_KEY = "lisbon_saved_events";

function loadSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(events.map((ev) => ev.id));
    return parsed.filter((id) => validIds.has(id));
  } catch {
    return [];
  }
}

function persistSavedIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors (e.g. private browsing / quota exceeded)
  }
}

let selectedCategory = "all";
let searchTerm = "";
let savedIds = loadSavedIds();

const grid = document.getElementById("events-grid");
const countText = document.getElementById("results-count");
const searchInput = document.getElementById("search-input");
const filterBtns = document.querySelectorAll(".filter-btn");
const savedCountEl = document.getElementById("saved-count");

function updateSavedCount() {
  if (savedCountEl) {
    savedCountEl.textContent = String(savedIds.length);
  }
}

function resetFilters() {
  selectedCategory = "all";
  searchTerm = "";
  searchInput.value = "";
  filterBtns.forEach((btn) => {
    const isActive = btn.dataset.category === "all";
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
  renderEvents();
}

function renderEvents() {
  updateSavedCount();

  const list = events.filter((ev) => {
    const matchCategory =
    selectedCategory === "all" ||
    (selectedCategory === "saved" ? savedIds.includes(ev.id) : ev.category === selectedCategory);

    const text = (ev.title + " " + ev.location + " " + ev.description + " " + ev.category).toLowerCase();
    const matchSearch = text.includes(searchTerm.trim().toLowerCase());

    return matchCategory && matchSearch;
  });

  countText.textContent = list.length === 1 ? "Showing 1 event" : `Showing ${list.length} events`;

  if (list.length === 0) {
    const isEmptySaved = selectedCategory === "saved" && savedIds.length === 0;
    const message = isEmptySaved
    ? "You haven't saved any events yet."
    : "No events found for that search.";
    const resetLabel = isEmptySaved ? "Show all events" : "Reset filters";

    grid.innerHTML = `
    <div class="empty-msg">
    <p>${message}</p>
    <button type="button" class="filter-btn reset-btn" style="margin-top: 0.75rem;">
    ${resetLabel}
    </button>
    </div>
    `;
    return;
  }

  grid.innerHTML = list
  .map((ev) => {
    const isSaved = savedIds.includes(ev.id);
    return `
    <article class="event-card">
    <div class="card-top">
    <span class="tag">${ev.category}</span>
    <span class="price">${ev.price}</span>
    </div>
    <h3>${ev.title}</h3>
    <p class="meta">${ev.date} · ${ev.location}</p>
    <p class="desc">${ev.description}</p>
    <button type="button" class="save-btn ${isSaved ? "saved" : ""}" data-id="${ev.id}" aria-pressed="${isSaved}" aria-label="${isSaved ? "Remove saved event" : "Save event"}: ${ev.title}">
    ${isSaved ? "Saved" : "Save"}
    </button>
    </article>
    `;
  })
  .join("");
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedCategory = btn.dataset.category;
    filterBtns.forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-pressed", String(isActive));
    });
    renderEvents();
  });
});

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderEvents();
});

grid.addEventListener("click", (e) => {
  if (e.target.closest(".reset-btn")) {
    resetFilters();
    return;
  }

  const btn = e.target.closest(".save-btn");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter((item) => item !== id);
  } else {
    savedIds.push(id);
  }

  persistSavedIds(savedIds);
  renderEvents();
});

// Map Open-Meteo WMO codes to label + OpenWeatherMap icon code
function getWeatherInfo(code, isDay = 1) {
  const suffix = isDay ? "d" : "n";

  if (code === 0) return { label: "Clear sky", icon: `01${suffix}` };
  if (code <= 2) return { label: "Partly cloudy", icon: `02${suffix}` };
  if (code === 3) return { label: "Overcast", icon: `04${suffix}` };
  if (code <= 48) return { label: "Foggy", icon: `50${suffix}` };
  if (code <= 57) return { label: "Drizzle", icon: `09${suffix}` };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: "Rain", icon: `10${suffix}` };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: `13${suffix}` };
  return { label: "Thunderstorm", icon: `11${suffix}` };
}

function getDayName(dateStr, index) {
  if (index === 0) return "Today";
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

async function loadWeather() {
  const mainBox = document.getElementById("weather-main");
  const forecastBox = document.getElementById("weather-forecast");
  const timeEl = document.getElementById("lisbon-time");

  const url =
  "https://api.open-meteo.com/v1/forecast?latitude=38.7223&longitude=-9.1393" +
  "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
  "&timezone=Europe%2FLisbon&forecast_days=3";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather");
    const data = await res.json();

    const current = data.current;
    const info = getWeatherInfo(current.weather_code, current.is_day);
    const iconUrl = `https://openweathermap.org/img/wn/${info.icon}@2x.png`;

    // Show current Lisbon local time
    const lisbonClock = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Europe/Lisbon",
      hour: "2-digit",
      minute: "2-digit"
    });
    timeEl.textContent = `Local time ${lisbonClock}`;

    mainBox.innerHTML = `
    <div class="weather-icon-wrap">
    <img src="${iconUrl}" alt="${info.label}" />
    </div>
    <div>
    <div class="weather-temp">${Math.round(current.temperature_2m)}°C</div>
    <div class="weather-desc">${info.label}</div>
    <div class="weather-extra">
    Feels like ${Math.round(current.apparent_temperature)}°C · Wind ${Math.round(current.wind_speed_10m)} km/h
    </div>
    </div>
    `;

    const days = data.daily.time;
    forecastBox.innerHTML = days
      .map((day, i) => {
        const dayInfo = getWeatherInfo(data.daily.weather_code[i], 1);
        const max = Math.round(data.daily.temperature_2m_max[i]);
        const min = Math.round(data.daily.temperature_2m_min[i]);
        return `
        <div class="forecast-day">
        <div class="forecast-day-name">${getDayName(day, i)}</div>
        <img src="https://openweathermap.org/img/wn/${dayInfo.icon}.png" alt="${dayInfo.label}" />
        <div class="forecast-temps">${max}° <span>/ ${min}°</span></div>
        </div>
        `;
      })
      .join("");
  } catch (err) {
    mainBox.innerHTML = `<p class="muted">Could not load live weather right now.</p>`;
    forecastBox.innerHTML = "";
  }
}

renderEvents();
loadWeather();
