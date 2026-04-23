/**
 * Utility to construct full image URLs from stored paths
 * Handles both relative paths and full URLs
 */

export const getImageUrl = (path) => {
  if (!path) return '/placeholder.png'; // Fallback for missing images
  if (path.startsWith('http')) return path; // Already a full URL
  return `http://localhost:5001/${path}`; // Append backend URL to relative path
};
