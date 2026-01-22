/**
 * DigiPIN - Digital Postal Index Number
 * Official Algorithm Implementation based on India Post's Open Source Release
 * https://github.com/INDIAPOST-gov/digipin
 * 
 * A 10-character alphanumeric code representing a 4x4 meter grid cell in India.
 */

// Geographical bounds for India (including EEZ)
const MIN_LAT = 2.5;
const MAX_LAT = 38.5;
const MIN_LON = 63.5;
const MAX_LON = 99.5;

// 4x4 Grid with anticlockwise spiral pattern
const DIGIPIN_GRID = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
];

// Reverse lookup: character -> [row, col]
const CHAR_TO_POS = {};
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
        CHAR_TO_POS[DIGIPIN_GRID[row][col]] = [row, col];
    }
}

/**
 * Encode latitude/longitude to DigiPIN
 * @param {number} lat - Latitude (2.5 to 38.5)
 * @param {number} lon - Longitude (63.5 to 99.5)
 * @returns {string|null} DigiPIN in XXX-XXX-XXXX format, or null if out of bounds
 */
export function encodeDigipin(lat, lon) {
    // Validate bounds
    if (lat < MIN_LAT || lat > MAX_LAT || lon < MIN_LON || lon > MAX_LON) {
        return null;
    }

    let minLat = MIN_LAT;
    let maxLat = MAX_LAT;
    let minLon = MIN_LON;
    let maxLon = MAX_LON;

    let digipin = '';

    for (let level = 0; level < 10; level++) {
        const latDiv = (maxLat - minLat) / 4;
        const lonDiv = (maxLon - minLon) / 4;

        // Calculate row (inverted because grid is top-down, but lat increases upward)
        let row = Math.floor((maxLat - lat) / latDiv);
        let col = Math.floor((lon - minLon) / lonDiv);

        // Clamp to valid range (handles edge cases at exact boundaries)
        row = Math.min(3, Math.max(0, row));
        col = Math.min(3, Math.max(0, col));

        digipin += DIGIPIN_GRID[row][col];

        // Update bounds for next level
        maxLat = maxLat - row * latDiv;
        minLat = maxLat - latDiv;
        minLon = minLon + col * lonDiv;
        maxLon = minLon + lonDiv;
    }

    // Format with hyphens: XXX-XXX-XXXX
    return `${digipin.slice(0, 3)}-${digipin.slice(3, 6)}-${digipin.slice(6, 10)}`;
}

/**
 * Decode DigiPIN to latitude/longitude (center of the cell)
 * @param {string} digipin - DigiPIN in XXX-XXX-XXXX or XXXXXXXXXX format
 * @returns {{lat: number, lon: number, bounds: {minLat: number, maxLat: number, minLon: number, maxLon: number}}|null}
 */
export function decodeDigipin(digipin) {
    // Remove hyphens and convert to uppercase
    const pin = digipin.replace(/-/g, '').toUpperCase();

    // Validate length
    if (pin.length !== 10) {
        return null;
    }

    // Validate characters
    for (const char of pin) {
        if (!CHAR_TO_POS[char]) {
            return null;
        }
    }

    let minLat = MIN_LAT;
    let maxLat = MAX_LAT;
    let minLon = MIN_LON;
    let maxLon = MAX_LON;

    for (let level = 0; level < 10; level++) {
        const char = pin[level];
        const [row, col] = CHAR_TO_POS[char];

        const latDiv = (maxLat - minLat) / 4;
        const lonDiv = (maxLon - minLon) / 4;

        // Update bounds based on the character's position
        const newMaxLat = maxLat - row * latDiv;
        const newMinLat = newMaxLat - latDiv;
        const newMinLon = minLon + col * lonDiv;
        const newMaxLon = newMinLon + lonDiv;

        minLat = newMinLat;
        maxLat = newMaxLat;
        minLon = newMinLon;
        maxLon = newMaxLon;
    }

    // Return center point and bounds
    return {
        lat: (minLat + maxLat) / 2,
        lon: (minLon + maxLon) / 2,
        bounds: { minLat, maxLat, minLon, maxLon }
    };
}

/**
 * Validate a DigiPIN format
 * @param {string} digipin - DigiPIN to validate
 * @returns {boolean} True if valid format
 */
export function isValidDigipin(digipin) {
    const pin = digipin.replace(/-/g, '').toUpperCase();
    if (pin.length !== 10) return false;
    
    for (const char of pin) {
        if (!CHAR_TO_POS[char]) return false;
    }
    return true;
}

/**
 * Format a raw 10-character DigiPIN with hyphens
 * @param {string} pin - Raw DigiPIN without hyphens
 * @returns {string} Formatted DigiPIN (XXX-XXX-XXXX)
 */
export function formatDigipin(pin) {
    const clean = pin.replace(/-/g, '').toUpperCase();
    if (clean.length !== 10) return pin;
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
}

/**
 * Check if coordinates are within India's DigiPIN coverage area
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if within bounds
 */
export function isWithinBounds(lat, lon) {
    return lat >= MIN_LAT && lat <= MAX_LAT && lon >= MIN_LON && lon <= MAX_LON;
}

// Export bounds for use in map initialization
export const INDIA_BOUNDS = {
    minLat: MIN_LAT,
    maxLat: MAX_LAT,
    minLon: MIN_LON,
    maxLon: MAX_LON,
    center: {
        lat: (MIN_LAT + MAX_LAT) / 2,
        lon: (MIN_LON + MAX_LON) / 2
    }
};
