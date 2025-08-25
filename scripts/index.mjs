import { fetchTrendingMovies } from "./tmdb-service.mjs";
import { formatCurrency, formatDate, getVideoUrl } from "./utilities.mjs";

// DOM Elements
const $searchInput = document.querySelector("#searchInput");
const $backBtn = document.querySelector("#backBtn");
const $homeView = document.querySelector("#homeView");
const $detailsView = document.querySelector("#detailsView");
const $loadingSpinner = document.querySelector("#loadingSpinner");
const $searchSection = document.querySelector("#searchSection");
const $trailerModal = document.querySelector("#trailerModal");
const $closeTrailerBtn = document.querySelector("#closeTrailerBtn");
const $trailerBtn = document.querySelector("#trailerBtn");

let currentView = "home";
let currentMovie = null;
let currentVideos = [];
let searchTimeout = null;

(async function () {
  const data = await fetchTrendingMovies();
  console.log(data);
})();
