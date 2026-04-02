import { CATEGORIES, CUT_TYPES, LISTING_TYPES, ORIGINS, STATUSES } from "./constants";

const MAX_IMAGES = 5;
const MAX_CARAT = 10000;
const MAX_PRICE = 100000000;
const MAX_STOCK = 100000;

const trim = (value) => (typeof value === "string" ? value.trim() : value);

export function sanitizeInventoryForm(form) {
  return {
    ...form,
    gem_name: trim(form.gem_name),
    gem_type: trim(form.gem_type),
    category: trim(form.category),
    color: trim(form.color),
    cut: trim(form.cut),
    origin: trim(form.origin),
    description: trim(form.description),
    listing_type: trim(form.listing_type),
    status: trim(form.status),
    images: (form.images || []).filter(Boolean),
    carat: Number(form.carat),
    price: Number(form.price),
    stock_quantity: Number(form.stock_quantity),
    low_stock_threshold: Number(form.low_stock_threshold),
  };
}

export function validateInventoryForm(form) {
  const errors = {};
  const sanitized = sanitizeInventoryForm(form);

  if (!sanitized.gem_name) errors.gem_name = "Gem name is required";
  else if (sanitized.gem_name.length < 2) errors.gem_name = "Gem name must be at least 2 characters";
  else if (sanitized.gem_name.length > 120) errors.gem_name = "Gem name must be 120 characters or fewer";

  if (!sanitized.gem_type) errors.gem_type = "Gem type is required";
  else if (sanitized.gem_type.length < 2) errors.gem_type = "Gem type must be at least 2 characters";
  else if (sanitized.gem_type.length > 120) errors.gem_type = "Gem type must be 120 characters or fewer";

  if (!CATEGORIES.includes(sanitized.category)) {
    errors.category = "Please choose a valid category";
  }

  if (!sanitized.color) errors.color = "Color is required";
  else if (sanitized.color.length < 2) errors.color = "Color must be at least 2 characters";
  else if (sanitized.color.length > 80) errors.color = "Color must be 80 characters or fewer";

  if (!Number.isFinite(sanitized.carat) || sanitized.carat <= 0) {
    errors.carat = "Valid carat weight is required";
  } else if (sanitized.carat > MAX_CARAT) {
    errors.carat = `Carat weight must be ${MAX_CARAT} or less`;
  }

  if (!CUT_TYPES.includes(sanitized.cut)) {
    errors.cut = "Please choose a valid cut";
  }

  if (!ORIGINS.includes(sanitized.origin)) {
    errors.origin = "Please choose a valid origin";
  }

  if (!Number.isFinite(sanitized.price) || sanitized.price <= 0) {
    errors.price = "Valid price is required";
  } else if (sanitized.price > MAX_PRICE) {
    errors.price = `Price must be ${MAX_PRICE.toLocaleString()} or less`;
  }

  if (!Number.isInteger(sanitized.stock_quantity) || sanitized.stock_quantity < 0) {
    errors.stock_quantity = "Stock quantity must be a whole number";
  } else if (sanitized.stock_quantity > MAX_STOCK) {
    errors.stock_quantity = `Stock quantity must be ${MAX_STOCK.toLocaleString()} or less`;
  }

  if (!Number.isInteger(sanitized.low_stock_threshold) || sanitized.low_stock_threshold < 0) {
    errors.low_stock_threshold = "Low stock alert level must be a whole number";
  } else if (sanitized.low_stock_threshold > MAX_STOCK) {
    errors.low_stock_threshold = `Low stock alert level must be ${MAX_STOCK.toLocaleString()} or less`;
  }

  if (!LISTING_TYPES.includes(sanitized.listing_type)) {
    errors.listing_type = "Please choose a valid listing type";
  }

  if (!STATUSES.includes(sanitized.status)) {
    errors.status = "Please choose a valid status";
  } else if (sanitized.status === "in_auction" && sanitized.listing_type !== "auction") {
    errors.status = "In Auction status requires the Auction listing type";
  }

  if (!sanitized.description) errors.description = "Description is required";
  else if (sanitized.description.length < 10) errors.description = "Description must be at least 10 characters";
  else if (sanitized.description.length > 2000) errors.description = "Description must be 2000 characters or fewer";

  if (sanitized.images.length > MAX_IMAGES) {
    errors.images = `You can upload up to ${MAX_IMAGES} images`;
  }

  return { errors, sanitized };
}
