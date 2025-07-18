// Register a listener for the DOMContentLoaded event. This is triggered when the HTML is loaded and the DOM is constructed.
// We are doing this because the script is loaded in the head of the document, so the DOM is not yet constructed when the script is executed.
import {
  createCard,
  clearCards,
  createForecast,
  createImageBackground,
  addSpinner,
  rmvSpinner,
  interpretWeatherCode,
  getPhoto,
  // addFavoriteCity,
  // addRemoveCity,
} from "./addElems.js";

//* Vrea sa menționez ca o parte din comentariile astea sunt lasate mentru mine din viitor, și trebuia sa fie puțin amuzante
//* Sper ca nu e o problema cand va uitati pe cod <3
//* Gabi din 2024 ;D

document.addEventListener("DOMContentLoaded", (_event) => {
  let cityInput = document.querySelector("#cityes"); // inputul orasului
  let currentCityList = new Array(); // orasele din autofill pentru cautare

  // orasele bookmarked
  let savedCities = JSON.parse(localStorage.getItem("cities")) || [];
  savedCities.forEach((cityKey) => {
    addFavoriteCity(cityKey);
  });

  //#region Search
  let pm = document.querySelector("#weatherShow"); // pm de la press me ;)
  pm.addEventListener("click", function () {
    let cityFound = false;
    currentCityList.forEach((elem) => {
      if (elem.key === cityInput.value) {
        cityFound = true;
        fetchRenderWeather(elem.lat, elem.lon, cityInput.value);
      }
    });

    if (!cityFound) {
      alert("This is not a real city");
    }
  });

  // Asta face autocompletu sa apara dupa 3 litere cu ce gaseste
  // sau sa caute in lista de favorite orasele, cand ai scris mai putin de 3 litere
  // Șmecher, știu
  cityInput.addEventListener("input", () => {
    const query = cityInput.value;
    if (query.length < 3) {
      renderSavedCities();
    } else if (query.length >= 3) {
      fetchCities(query);
    }
  });
  //#endregion

  // #region Favorite Bookmark
  // Butonul care deschide lista de favorite si functionalitatile lui :)
  const bookMarkButton = document.querySelector(".bookmark");
  const slideSection = document.querySelector("#slideSection");

  bookMarkButton.addEventListener("click", function () {
    slideSection.classList.toggle("active");
    bookMarkButton.classList.add("shrink");

    setTimeout(() => {
      bookMarkButton.classList.remove("shrink");
    }, 200);
  });

  // Aside se inchide daca dai click in alta parte
  document.addEventListener("click", function (event) {
    if (
      !slideSection.contains(event.target) &&
      !bookMarkButton.contains(event.target)
    ) {
      slideSection.classList.remove("active");
    }
  });
  // #endregion

  // #region Get Orase & Pozitii
  // Asta face rost de lista de autocomplete si de orase. parca si de pozitiile lor geografice;
  function fetchCities(query) {
    fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=5b7e9a85983f4c8db7e256ba9fbbc596`
    )
      .then((response) => response.json())
      .then((data) => {
        currentCityList = data.features;
        renderDatalist(data.features);
      })
      .catch((error) => console.warn("Eroare:", error));
  }
  // #endregion

  // #region Date Meteo Get si Afis
  // Asta cauta datele meteo si le afiseaza pe ecranul principal
  function fetchRenderWeather(lat, long, title) {
    // daca mai e textul de la inceput, sa dispara
    if (document.querySelector("#startText"))
      document.querySelector("#startText").remove();

    addSpinner(document.querySelector(".container"));
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    )
      .then((response) => response.json())
      .then((data) => {
        rmvSpinner(document.querySelector(".container"));

        if (data.current.temperature_2m) {
          clearCards(".container");
          createCard(
            ".container",
            title,
            data.current.weather_code,
            data.current.temperature_2m,
            data.current_units.temperature_2m,
            data.current.relative_humidity_2m,
            data.current_units.relative_humidity_2m,
            data.current.wind_speed_10m,
            data.current_units.wind_speed_10m,
            data.current.precipitation,
            data.current_units.precipitation
          );
          createImageBackground(
            ".container",
            title,
            interpretWeatherCode(data.current.weather_code)
          );
          createForecast(
            ".container",
            5,
            data.daily.temperature_2m_min,
            data.daily.temperature_2m_max,
            data.daily.weather_code
          );

          // #region The Save Button Feature
          const saveButton = document.querySelector("#saveButton");
          let cityKeyTitle = document.querySelector(".text-title");
          if (saveButton) {
            let isSaved = savedCities.some(
              (ob) => ob.key === cityKeyTitle.textContent
            );

            saveButton.src = isSaved
              ? "assets/svg/SaveSystemSvg/heart-saved.svg"
              : "assets/svg/SaveSystemSvg/heart-add.svg";

            saveButton.addEventListener("click", () => {
              saveButton.classList.add("shrink");

              setTimeout(() => {
                saveButton.classList.remove("shrink");

                if (isSaved) {
                  // daca e salvat stergem
                  savedCities = savedCities.filter((ob) => {
                    if (ob.key === cityKeyTitle.textContent) {
                      addRemoveCity(ob);
                      return false;
                    }
                    return true;
                  });
                  saveButton.src = "assets/svg/SaveSystemSvg/heart-add.svg";
                } else {
                  // daca nu e salvat, salvam
                  let obj = {
                    key: cityKeyTitle.textContent,
                    lat: lat,
                    lon: long,
                  };

                  // Obține URL-ul fotografiei și adaugă obiectul doar după aceea
                  getPhoto(`buildings from ${obj.key}`).then((photoURL) => {
                    if (photoURL) {
                      obj.url = `url(${photoURL})`;
                    } else {
                      console.warn("No photo available for city:", obj.key);
                    }

                    // Adaugă în lista de orașe salvate și actualizează UI-ul după ce URL-ul este obținut
                    savedCities.push(obj);
                    localStorage.setItem("cities", JSON.stringify(savedCities)); // Actualizează localStorage

                    saveButton.src = "assets/svg/SaveSystemSvg/heart-saved.svg";
                    addFavoriteCity(obj); // Apelează funcția doar după ce ai URL-ul
                  });
                }

                localStorage.setItem("cities", JSON.stringify(savedCities));
                isSaved = !isSaved;
              }, 200); // asta e legata de css acolo; probabil era bine daca faceai si tu o variabila ceva, dar na, aia e acum...
              // actually, pot face variabile asa?
            });
          }

          cityInput.value = "";
        }
        // #endregion
      })
      .catch((error) => console.warn("Eroare:", error));
  }
  // #endregion

  // #region Autocomplete Orase
  function renderDatalist(features) {
    let existingDatalist = document.querySelector("#citesList");
    if (existingDatalist) {
      existingDatalist.remove();
    }

    let datalist = document.createElement("datalist");
    datalist.id = "citesList";
    cityInput.setAttribute("list", datalist.id);

    let fragment = document.createDocumentFragment();

    // Asta ca sa nu avem duplicate, gen ${Paris, Franta adresa 12} si ${Paris, Franta adresa 15}
    currentCityList = new Array();
    let seenCityes = new Set();
    for (let feature of features) {
      let cityKey = `${feature.properties.city}, ${feature.properties.country}`;

      if (!seenCityes.has(cityKey)) {
        seenCityes.add(cityKey);

        let option = document.createElement("option");
        option.value = cityKey;
        fragment.appendChild(option);

        currentCityList.push({
          key: cityKey,
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        });
      }
    }

    datalist.append(fragment);
    cityInput.after(datalist);
  }

  // Pentru orasele salvate
  function renderSavedCities() {
    let existingDatalist = document.querySelector("#citesList");
    if (existingDatalist) {
      existingDatalist.remove();
    }

    let datalist = document.createElement("datalist");
    datalist.id = "citesList";
    cityInput.setAttribute("list", datalist.id);

    let fragment = document.createDocumentFragment();

    savedCities.forEach((city) => {
      let option = document.createElement("option");
      option.value = city.key;
      fragment.appendChild(option);
    });

    datalist.append(fragment);
    cityInput.after(datalist);
  }
  // #endregion

  // #region Bookmark Functions
  function addFavoriteCity(obj) {
    //scoatem textul cu nu ai salvat orase:
    if (document.querySelector("#noSavesYet"))
      document.querySelector("#noSavesYet").setAttribute("hidden", "");

    const card = document.createElement("div");
    card.classList.add("card", "card-favorite");

    const title = document.createElement("p");
    title.textContent = obj.key;
    card.style.backgroundImage = obj.url;
    card.appendChild(title);

    card.addEventListener("click", () => {
      fetchRenderWeather(obj.lat, obj.lon, obj.key);
      slideSection.classList.remove("active");
    });

    document.querySelector("#slideSection").appendChild(card);
  }

  function addRemoveCity(obj) {
    const allCards = document.querySelectorAll("#slideSection .card-favorite");

    allCards.forEach((card) => {
      const title = card.querySelector("p");

      if (title && title.textContent === obj.key) {
        card.remove();
      }
    });

    if (allCards.length == 1) {
      document.querySelector("#noSavesYet").removeAttribute("hidden");
    }
  }
  // #endregion
});
