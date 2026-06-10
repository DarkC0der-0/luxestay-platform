/**
 * Format a number as a currency string.
 * 
 * @param {number} amount - The numeric value to format.
 * @param {string} [currency='USD'] - The 3-letter currency code (e.g., USD, EUR).
 * @param {string} [locale='en-US'] - The locale string.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate the total price of a booking including service fees.
 * 
 * @param {number} pricePerNight - The base price per night.
 * @param {number} nights - The total number of nights.
 * @param {number} [serviceFeeRate=0.1] - The service fee multiplier (default 10%).
 * @returns {number} The final calculated price.
 */
export function calculateTotalPrice(pricePerNight, nights, serviceFeeRate = 0.1) {
  const basePrice = pricePerNight * nights;
  return basePrice + (basePrice * serviceFeeRate);
}
