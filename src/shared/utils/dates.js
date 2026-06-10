/**
 * Calculate the number of nights between two dates.
 * 
 * @param {string|Date} checkIn - The check-in date.
 * @param {string|Date} checkOut - The check-out date.
 * @returns {number} The total number of nights.
 */
export function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  // Calculate difference in milliseconds
  const diffTime = Math.abs(end - start);
  
  // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
