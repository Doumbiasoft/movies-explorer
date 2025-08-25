const API_KEY = "3e9b85d24bce4c4cd45845190834a1f6";
const BASE_URL = "https://api.themoviedb.org/3";

// Axios Configuration
const headers = {
  Authorization: "Bearer " + API_KEY,
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: headers,
});

axiosInstance.interceptors.request.use(
  function (req) {
    req.metadata = req.metadata || {};
    req.metadata.startTime = new Date().getTime();
    var startTime = new Date().toLocaleString();
    console.log(
      "⏳ Request is starting at " + startTime + ". (based on local time)"
    );
    return req;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (res) {
    res.config.metadata.endTime = new Date().getTime();
    res.config.metadata.durationInMS =
      res.config.metadata.endTime - res.config.metadata.startTime;
    console.log(
      "⏳ Request took " + res.config.metadata.durationInMS + " milliseconds."
    );
    return res;
  },
  function (error) {
    if (error.config && error.config.metadata) {
      error.config.metadata.endTime = new Date().getTime();
      error.config.metadata.durationInMS =
        error.config.metadata.endTime - error.config.metadata.startTime;
      console.log(
        "⏳ Request took " +
          error.config.metadata.durationInMS +
          " milliseconds."
      );
    }
    throw error;
  }
);
const fetchData = async (url) => {
  try {
    var response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error(
      "❌ API Error:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

export const fetchTrendingMovies = async () => {
  const data = await fetchData("/trending/movie/day");
  return data && data.results ? data.results : [];
};

export const fetchPopularMovies = async () => {
  const data = await fetchData("/movie/popular");
  return data && data.results ? data.results : [];
};

export const searchMovies = async (query) => {
  const data = await fetchData(
    `/search/movie?query=${encodeURIComponent(query)}`
  );
  return data && data.results ? data.results : [];
};

export const fetchMovieDetails = async (movieId) => {
  const data = await fetchData(`/movie/${movieId}?append_to_response=videos`);
  return data;
};
