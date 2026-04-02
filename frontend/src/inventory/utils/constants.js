const DEMO_ADMIN_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL || "admin@gmail.com";
const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin123";
const DEMO_SELLER_EMAIL = import.meta.env.VITE_DEMO_SELLER_EMAIL || "seller@gmail.com";
const DEMO_SELLER_PASSWORD = import.meta.env.VITE_DEMO_SELLER_PASSWORD || "seller123";
export const DEFAULT_STOCK_QUANTITY = 10;
export const DEFAULT_LOW_STOCK_THRESHOLD = 3;

export const CATEGORIES = [
  "Sapphire",
  "Ruby",
  "Emerald",
  "Diamond",
  "Aquamarine",
  "Topaz",
  "Amethyst",
  "Garnet",
  "Opal",
  "Tourmaline",
  "Spinel",
  "Pearl",
  "Other",
];

export const STATUSES = ["active", "sold", "archived", "unavailable", "in_auction"];
export const LISTING_TYPES = ["direct_sale", "auction"];
export const CUT_TYPES = [
  "round",
  "oval",
  "cushion",
  "emerald",
  "princess",
  "pear",
  "marquise",
  "heart",
  "uncut",
  "cabochon",
  "other",
];
export const ORIGINS = [
  "Ratnapura",
  "Elahera",
  "Balangoda",
  "Rakwana",
  "Pelmadulla",
  "Eheliyagoda",
  "Kahawatta",
  "Nivitigala",
  "Monaragala",
  "Okkampitiya",
  "Mogok, Myanmar",
  "Sri Lanka",
  "Other",
];

export const STATUS_LABELS = {
  active: "Active",
  sold: "Sold",
  archived: "Archived",
  unavailable: "Unavailable",
  in_auction: "In Auction",
};

export const LISTING_TYPE_LABELS = {
  direct_sale: "Direct Sale",
  auction: "Auction",
};

export const STATUS_COLORS = {
  active: "#15803d",
  sold: "#7c3aed",
  archived: "#64748b",
  unavailable: "#dc2626",
  in_auction: "#d97706",
};

export const STATUS_BG = {
  active: "#dcfce7",
  sold: "#f3e8ff",
  archived: "#f1f5f9",
  unavailable: "#fee2e2",
  in_auction: "#fef3c7",
};

export const DEMO_CREDENTIALS = [
  { role: "Admin", email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD },
  { role: "Seller", email: DEMO_SELLER_EMAIL, password: DEMO_SELLER_PASSWORD },
];
