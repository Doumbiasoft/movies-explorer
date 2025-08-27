import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchMovieDetails,
  searchMovies,
  API_TOKEN,
} from "./tmdb-service.mjs";
import { formatCurrency, formatDate, getVideoUrl } from "./utilities.mjs";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

// DOM Elements
const $searchInput = document.querySelector("#searchInput");
const $backBtn = document.querySelector("#backBtn");
const $homeView = document.querySelector("#homeView");
const $detailsView = document.querySelector("#detailsView");
const $loadingSpinner = document.querySelector("#loadingSpinner");
const $searchSection = document.querySelector("#searchSection");
const $trailerModal = document.querySelector("#trailerModal");
const $closeTrailerBtn = document.querySelector("#closeTrailerBtn");
const $heroContent = document.querySelector("#heroContent");

let currentView = "home";
let currentMovie = null;
let currentVideos = [];
let searchTimeout = null;

const showLoading = (show) => {
  show = show !== undefined ? show : true;
  if (show) {
    $loadingSpinner.classList.remove("hidden");
  } else {
    $loadingSpinner.classList.add("hidden");
  }
};

const createMovieCard = (movie) => {
  const posterUrl = movie.poster_path
    ? IMAGE_BASE_URL + movie.poster_path
    : "https://via.placeholder.com/300x450/374151/ffffff?text=No+Image";

  const card = document.createElement("div");
  card.className =
    "bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105";
  card.innerHTML =
    '<img src="' +
    posterUrl +
    '" alt="' +
    movie.title +
    '" class="w-full h-64 object-cover" />' +
    '<div class="p-4">' +
    '<h3 class="font-bold text-white mb-2 line-clamp-2">' +
    movie.title +
    "</h3>" +
    '<div class="flex items-center justify-between text-sm text-gray-400">' +
    '<div class="flex items-center">' +
    '<svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">' +
    '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>' +
    "</svg>" +
    "<span>" +
    movie.vote_average.toFixed(1) +
    "</span>" +
    "</div>" +
    '<div class="flex items-center">' +
    '<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">' +
    '<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>' +
    "</svg>" +
    "<span>" +
    new Date(movie.release_date).getFullYear() +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>";

  card.addEventListener("click", () => {
    openMovieDetails(movie);
  });
  return card;
};

const renderMovies = (movies, containerId) => {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  movies.slice(0, 18).forEach((movie) => {
    container.appendChild(createMovieCard(movie));
  });
};

const openMovieDetails = async (movie) => {
  currentMovie = movie;
  showLoading(true);

  const details = await fetchMovieDetails(movie.id);
  console.log(details);

  if (!details) {
    showLoading(false);
    return;
  }

  currentVideos =
    details.videos && details.videos.results ? details.videos.results : [];
  const $movieBackdrop = document.querySelector("#movieBackdrop");
  // Update backdrop
  if (details.backdrop_path) {
    $movieBackdrop.style.backgroundImage =
      "url(" + BACKDROP_BASE_URL + details.backdrop_path + ")";
    $movieBackdrop.classList.remove("hidden");
  } else {
    $movieBackdrop.classList.add("hidden");
  }

  // Update movie info
  document.getElementById("movieTitle").textContent = details.title;
  document.getElementById("movieTagline").textContent = details.tagline || "";
  document.getElementById("moviePoster").src = details.poster_path
    ? IMAGE_BASE_URL + details.poster_path
    : "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image";
  document.getElementById("movieRating").textContent =
    details.vote_average.toFixed(1) + "/10";
  document.getElementById("movieVotes").textContent =
    "(" + details.vote_count + " votes)";
  document.getElementById("movieDate").textContent = formatDate(
    details.release_date
  );
  document.getElementById("movieRuntime").textContent =
    details.runtime + " minutes";
  document.getElementById("movieBudget").textContent = formatCurrency(
    details.budget
  );
  document.getElementById("movieRevenue").textContent = formatCurrency(
    details.revenue
  );
  document.getElementById("movieOverview").textContent = details.overview;

  // Update genres
  const $genresContainer = document.getElementById("movieGenres");
  $genresContainer.innerHTML = "";
  details.genres.forEach((genre) => {
    const $genreSpan = document.createElement("span");
    $genreSpan.className =
      "px-3 py-1 bg-yellow-500 text-black rounded-full text-sm";
    $genreSpan.textContent = genre.name;
    $genresContainer.appendChild($genreSpan);
  });

  // Update production companies
  const $companiesContainer = document.getElementById("productionCompanies");
  $companiesContainer.innerHTML = "";
  details.production_companies.forEach((company) => {
    const $companyDiv = document.createElement("span");
    $companyDiv.className = "text-gray-300 block";
    $companyDiv.textContent = company.name;
    $companiesContainer.appendChild($companyDiv);
  });

  // Update countries
  const $countriesContainer = document.getElementById("productionCountries");
  $countriesContainer.innerHTML = "";
  details.production_countries.forEach((country) => {
    const $countrySpan = document.createElement("span");
    $countrySpan.className = "text-gray-300";
    $countrySpan.textContent = country.name;
    $countriesContainer.appendChild($countrySpan);
  });

  // Handle trailers
  const trailers = currentVideos.filter((video) => {
    return video.type === "Trailer";
  });
  const mainTrailer =
    trailers.find((video) => {
      return video.site === "YouTube";
    }) || trailers[0];

  const $trailerBtnEl = document.getElementById("trailerBtn");
  if (mainTrailer) {
    $trailerBtnEl.classList.remove("hidden");
    $trailerBtnEl.onclick = () => {
      openTrailer(mainTrailer);
    };
  } else {
    $trailerBtnEl.classList.add("hidden");
  }

  // Additional trailers
  const $additionalTrailersSection = document.getElementById(
    "additionalTrailersSection"
  );
  const $additionalTrailersContainer =
    document.getElementById("additionalTrailers");

  if (trailers.length > 1) {
    $additionalTrailersSection.classList.remove("hidden");
    $additionalTrailersContainer.innerHTML = "";

    trailers.slice(1).forEach((video) => {
      const $trailerBtn = document.createElement("button");
      $trailerBtn.className =
        "block w-full text-left p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer";
      $trailerBtn.innerHTML =
        '<div class="flex items-center">' +
        '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">' +
        '<path d="M6.5 5.5v9l7.5-4.5-7.5-4.5z"/>' +
        "</svg>" +
        video.name +
        "</div>";
      $trailerBtn.onclick = function () {
        openTrailer(video);
      };
      $additionalTrailersContainer.appendChild($trailerBtn);
    });
  } else {
    $additionalTrailersSection.classList.add("hidden");
  }

  $homeView.classList.add("hidden");
  $heroContent.classList.add("hidden");
  $detailsView.classList.remove("hidden");
  $backBtn.classList.remove("hidden");
  currentView = "details";
  showLoading(false);
};

const openTrailer = (video) => {
  var videoUrl = getVideoUrl(video.site, video.key, true);
  if (!videoUrl) return;

  document.getElementById("trailerTitle").textContent = video.name;
  document.getElementById("trailerFrame").src = videoUrl;
  $trailerModal.classList.remove("hidden");
};

const closeTrailer = () => {
  document.getElementById("trailerFrame").src = "";
  $trailerModal.classList.add("hidden");
};

const goHome = () => {
  const $movieBackdrop = document.querySelector("#movieBackdrop");

  $detailsView.classList.add("hidden");
  $homeView.classList.remove("hidden");
  $heroContent.classList.remove("hidden");
  $backBtn.classList.add("hidden");
  $movieBackdrop.classList.add("hidden");
  $movieBackdrop.style.backgroundImage = "";
  $searchInput.value = "";
  $searchSection.classList.add("hidden");
  document.getElementById("trendingSection").classList.remove("hidden");
  document.getElementById("popularSection").classList.remove("hidden");
  currentView = "home";
};

const handleSearchInput = (inputElement) => {
  const query = inputElement.value;
  $searchInput.value = query;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(handleSearch, 300);
};

const handleSearch = async () => {
  const query = $searchInput.value.trim();
  if (!query) {
    $searchSection.classList.add("hidden");
    if (currentView === "home") {
      document.getElementById("trendingSection").classList.remove("hidden");
      document.getElementById("popularSection").classList.remove("hidden");
    }
    return;
  }

  showLoading(true);
  if (currentView === "home") {
    document.getElementById("trendingSection").classList.add("hidden");
    document.getElementById("popularSection").classList.add("hidden");
  }

  const results = await searchMovies(query);

  document.getElementById("searchTitle").textContent =
    'Search Results for "' + query + '"';

  if (results.length > 0) {
    renderMovies(results, "searchResults");
    document.getElementById("searchResults").classList.remove("hidden");
    document.getElementById("noResults").classList.add("hidden");
  } else {
    document.getElementById("searchResults").classList.add("hidden");
    document.getElementById("noResults").classList.remove("hidden");
  }

  $searchSection.classList.remove("hidden");
  showLoading(false);
};

// Event Listeners
$searchInput.addEventListener("input", () => {
  handleSearchInput($searchInput);
});

$backBtn.addEventListener("click", goHome);
$closeTrailerBtn.addEventListener("click", closeTrailer);
$trailerModal.addEventListener("click", (e) => {
  if (e.target === $trailerModal) closeTrailer();
});

const initApp = async () => {
  showLoading(true);

  if (API_TOKEN === "API_TOKEN") {
    alert("Please set your TMDB API Token in the JavaScript code!");
    showLoading(false);
    return;
  }

  try {
    const [trending, popular] = await Promise.all([
      fetchTrendingMovies(),
      fetchPopularMovies(),
    ]);

    renderMovies(trending, "trendingMovies");
    renderMovies(popular, "popularMovies");
  } catch (error) {
    console.error("Error initializing app:", error);
  }

  showLoading(false);
};

(async function () {
  await initApp();
})();
