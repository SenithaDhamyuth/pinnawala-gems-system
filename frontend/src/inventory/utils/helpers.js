import { LISTING_TYPE_LABELS } from "./constants";

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "LKR",
  }).format(Number(price || 0));

export const formatDate = (dateStr) => {
  if (!dateStr) {
    return "-";
  }

  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getImageUrl = (url) => {
  if (!url) {
    return null;
  }
  return url;
};

export const truncate = (str, maxLength = 60) =>
  str && str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

export const formatLabel = (value) =>
  value
    ? value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "-";

export const formatListingType = (value) => LISTING_TYPE_LABELS[value] || formatLabel(value);

export const buildFilterParams = (filters) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue !== "") {
        params[key] = trimmedValue;
      }
      return;
    }

    if (value !== "" && value !== null && value !== undefined) {
      params[key] = value;
    }
  });

  return params;
};
