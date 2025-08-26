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

(async function () {
  await initApp();
})();
