import { fetchTrendingMovies } from "./tmdb-service.mjs";

(async function () {
  const data = await fetchTrendingMovies();
  console.log(data);
})();
