export const formatCurrency = (amount) => {
  return amount > 0 ? "$" + amount.toLocaleString() : "N/A";
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const getVideoUrl = (site, key, embed) => {
  embed = embed !== undefined ? embed : true;
  if (site === "YouTube") {
    return embed
      ? "https://www.youtube.com/embed/" + key
      : "https://www.youtube.com/watch?v=" + key;
  } else if (site === "Vimeo") {
    return embed
      ? "https://player.vimeo.com/video/" + key
      : "https://vimeo.com/" + key;
  }
  return null;
};
