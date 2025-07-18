// #region Cardul Principal
// datele zilei de azi si acum
export function createCard(
  containerSelector,
  numeOras,
  weatherCode,
  temperature,
  t_units,
  humidity,
  h_units,
  windSpeed,
  w_units,
  precipitation,
  p_units
) {
  const container = document.querySelector(containerSelector);

  const card = document.createElement("div");
  card.classList.add("card", "card-1");

  const oras = document.createElement("p");
  oras.textContent = `${numeOras}`;
  oras.classList.add("text-title");

  const saveIm = document.createElement("img");
  saveIm.src = "assets/svg/SaveSystemSvg/heart-add.svg";
  saveIm.id = "saveButton";
  saveIm.classList.add("saveImage");

  const titleLine = document.createElement("div");
  titleLine.classList.add("titleLine");
  titleLine.appendChild(oras);
  titleLine.appendChild(saveIm);

  card.appendChild(titleLine);

  const img = document.createElement("img");
  img.id = "tipVremeImag";
  updateWeatherImage(img, weatherCode);
  card.appendChild(img);

  const tipVreme = document.createElement("p");
  tipVreme.id = "tipVreme";
  tipVreme.textContent = interpretWeatherCode(weatherCode);
  card.appendChild(tipVreme);

  const temp = document.createElement("p");
  temp.textContent = `Current Temperature: ${temperature} ${t_units}`;
  card.appendChild(temp);

  const umid = document.createElement("p");
  umid.textContent = `Relative Humidity: ${humidity} ${h_units}`;
  card.appendChild(umid);

  const vant = document.createElement("p");
  vant.textContent = `Wind Speed: ${windSpeed} ${w_units}`;
  card.appendChild(vant);

  const precip = document.createElement("p");
  precip.textContent = `Precipitation: ${precipitation} ${p_units}`;
  card.appendChild(precip);

  container.appendChild(card);
}
// #endregion

// #region Urmatoarele 5 zile
// da e facut misto si poti pune mai mult de 5, dar nu e facut din css sa arate bine, iar linkul care ia date, ia doar 7 zile, dar se poate schimba acolo
export function createForecast(
  containerSelector,
  zile,
  tempMinArray,
  tempMaxArray,
  weatherCodeArray
) {
  const container = document.querySelector(containerSelector);

  const card = document.createElement("div");
  card.classList.add("card", "card-2");

  for (let i = 0; i < zile; i++) {
    const cardDay = document.createElement("section");
    cardDay.classList.add("card-day");

    const img = document.createElement("img");
    img.classList.add("wImag");
    updateWeatherImage(img, weatherCodeArray[i]);

    const mm = document.createElement("section");
    mm.classList.add("minMax");

    const min = document.createElement("p");
    const bara = document.createElement("p");
    const max = document.createElement("p");

    mm.appendChild(min);
    mm.appendChild(bara);
    mm.appendChild(max);

    min.textContent = tempMinArray[i];
    bara.textContent = "|";
    max.textContent = tempMaxArray[i];

    cardDay.appendChild(img);
    cardDay.appendChild(mm);
    card.appendChild(cardDay);
  }

  container.appendChild(card);
}
// #endregion

// #region Poza cu "Orasul" de pe ecranul principal
export async function createImageBackground(
  containerSelector,
  numeOras,
  vreme
) {
  const container = document.querySelector(containerSelector);
  const card = document.createElement("div");
  card.classList.add("card", "card-3", "cityImageBackground");
  container.appendChild(card);

  addSpinner(card);

  const imageUrl = await getPhoto(
    `Buildings from ${numeOras} in a ${vreme} weather`
  );

  if (imageUrl) {
    card.style.backgroundImage = `url(${imageUrl})`;
    rmvSpinner(card);

    const title = document.createElement("p");
    title.textContent = numeOras;
    title.id = "bigTitle";
    card.appendChild(title);
  } else {
    console.log("Nu am găsit o imagine pentru oraș");
  }
}

export async function getPhoto(query) {
  const apiKey = "Er5oOlsiHRodBctuAQyVymunz7jmfsiHTSyHxlha76JEDYvOs0t07R9o";
  const url = `https://api.pexels.com/v1/search?query=${query}&orientation=landscape&per_page=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    const data = await response.json();

    if (data && data.photos && data.photos.length > 0) {
      return data.photos[0].src.original;
    } else {
      throw new Error("No photos found");
    }
  } catch (error) {
    console.error("Error fetching photo:", error);
    return null;
  }
}
// #endregion

//#region Clear
export function clearCards(containerSelector) {
  const container = document.querySelector(containerSelector);
  const cards = container.querySelectorAll(".card");
  cards.forEach((card) => card.remove());
}
// #endregion

// #region Loading Spinner
export function addSpinner(container) {
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  container.appendChild(spinner);
}

export function rmvSpinner(container) {
  const spinner = container.querySelector(".spinner");
  spinner.remove();
}
// #endregion

// #region Functii Interpretare Vreme
export function interpretWeatherCode(wC) {
  const weatherDescriptions = {
    // sun
    0: "Sunny",

    // sun cloud
    1: "Slightly cloudy",
    2: "Partly cloudy",

    // cloud
    3: "Cloudy",
    45: "Fog",
    48: "Depositing fog",

    // cloud drizzle
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Intense drizzle",
    56: "Light freezing drizzle",
    57: "Intense freezing drizzle",

    // cloud rain
    61: "Light rain",
    63: "Moderate rain",
    80: "Light showers",
    81: "Moderate showers",

    // rain
    65: "Heavy rain",
    82: "Heavy showers",

    // rain snow
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    85: "Light snow showers",
    86: "Heavy snow showers",

    // cloud snow
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow flurries",

    // cloud lightning
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with severe hail",
  };

  return weatherDescriptions[wC] || "Unknown weather code";
}

function updateWeatherImage(element, wC) {
  const weatherIcons = {
    // soare
    0: "soare.svg",

    // soare nor
    1: "soare-nor.svg",
    2: "soare-nor.svg",

    // nor
    3: "nor.svg",
    45: "nor.svg",
    48: "nor.svg",

    // nor burnita
    51: "nor-burnita.svg",
    53: "nor-burnita.svg",
    55: "nor-burnita.svg",
    56: "nor-burnita.svg",
    57: "nor-burnita.svg",

    // nor ploaie
    61: "nor-ploaie.svg",
    63: "nor-ploaie.svg",
    80: "nor-ploaie.svg",
    81: "nor-ploaie.svg",

    // ploaie
    65: "ploaie.svg",
    82: "ploaie.svg",

    // ploaie zapada
    66: "ploaie-zapada.svg",
    67: "ploaie-zapada.svg",
    85: "ploaie-zapada.svg",
    86: "ploaie-zapada.svg",

    // nor zapada
    71: "nor-zapada.svg",
    73: "nor-zapada.svg",
    75: "nor-zapada.svg",
    77: "nor-zapada.svg",

    // nor fulger
    95: "furtuna.svg",
    96: "furtuna.svg",
    99: "furtuna.svg",
  };

  const imageName = weatherIcons[wC] || "soare.svg";

  element.src = `assets/svg/WeatherSvg/${imageName}`;
}
// #endregion
