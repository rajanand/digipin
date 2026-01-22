/**
 * DigiPIN Web App - Main Application Logic
 * Handles map interactions, search, URL routing, and UI state
 */

import { encodeDigipin, decodeDigipin, isValidDigipin, formatDigipin, isWithinBounds, INDIA_BOUNDS } from './digipin.js';

// ========================================
// Global State
// ========================================
let map = null;
let marker = null;
let gridRect = null;
let currentLocation = { lat: null, lon: null, digipin: null };

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme');

    updateThemeIcons(currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('digipin-theme', newTheme);
        updateThemeIcons(newTheme);

        // Update map tiles if needed
        updateMapTiles(newTheme);
    });
}

function updateThemeIcons(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

function updateMapTiles(theme) {
    if (!map) return;

    // Remove existing tile layer
    map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });

    // Add appropriate tile layer based on theme
    const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
}

// ========================================
// Map Initialization
// ========================================
function initMap() {
    const theme = document.documentElement.getAttribute('data-theme');

    // Initialize map centered on India
    map = L.map('map', {
        center: [20.5937, 78.9629], // Center of India
        zoom: 5,
        minZoom: 4,
        maxZoom: 19,
        zoomControl: false // We'll use custom controls
    });

    // Add tile layer based on theme
    updateMapTiles(theme);

    // Add click handler
    map.on('click', handleMapClick);

    // Bind custom zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoomOutBtn').addEventListener('click', () => map.zoomOut());
    document.getElementById('locateMeBtn').addEventListener('click', locateUser);
}

function handleMapClick(e) {
    const { lat, lng } = e.latlng;

    if (!isWithinBounds(lat, lng)) {
        showToast('Location is outside DigiPIN coverage area (India)', 'error');
        return;
    }

    setLocation(lat, lng);
}

function setLocation(lat, lon, zoom = null, updateUrl = true) {
    const digipin = encodeDigipin(lat, lon);

    if (!digipin) {
        showToast('Could not generate DigiPIN for this location', 'error');
        return;
    }

    currentLocation = { lat, lon, digipin };

    // Update marker
    if (marker) {
        marker.setLatLng([lat, lon]);
    } else {
        marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'custom-marker-wrapper',
                html: '<div class="custom-marker"></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            })
        }).addTo(map);
    }

    // Draw grid cell
    drawGridCell(lat, lon);

    // Center map if needed
    if (zoom) {
        map.setView([lat, lon], zoom);
    } else if (!map.getBounds().contains([lat, lon])) {
        map.setView([lat, lon], Math.max(map.getZoom(), 15));
    }

    // Update UI
    updateResultPanel(digipin, lat, lon);

    // Update URL
    if (updateUrl) {
        updateUrlState('pin', digipin);
    }
}

function drawGridCell(lat, lon) {
    const decoded = decodeDigipin(encodeDigipin(lat, lon));
    if (!decoded) return;

    const { bounds } = decoded;

    if (gridRect) {
        map.removeLayer(gridRect);
    }

    gridRect = L.rectangle([
        [bounds.minLat, bounds.minLon],
        [bounds.maxLat, bounds.maxLon]
    ], {
        color: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim(),
        weight: 2,
        fillOpacity: 0.2,
        dashArray: '5, 5'
    }).addTo(map);
}

// ========================================
// Result Panel
// ========================================
function updateResultPanel(digipin, lat, lon) {
    document.getElementById('digipinValue').textContent = digipin;
    document.getElementById('latValue').textContent = lat.toFixed(6);
    document.getElementById('lonValue').textContent = lon.toFixed(6);

    // Show panel
    document.getElementById('resultPanel').classList.add('visible');
}

function hideResultPanel() {
    document.getElementById('resultPanel').classList.remove('visible');

    // Clear marker and grid
    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
    if (gridRect) {
        map.removeLayer(gridRect);
        gridRect = null;
    }

    currentLocation = { lat: null, lon: null, digipin: null };

    // Clear URL params
    history.replaceState(null, '', window.location.pathname);
}

function initResultPanel() {
    document.getElementById('closePanelBtn').addEventListener('click', hideResultPanel);

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
        if (currentLocation.digipin) {
            navigator.clipboard.writeText(currentLocation.digipin).then(() => {
                const btn = document.getElementById('copyBtn');
                btn.classList.add('copied');
                showToast('DigiPIN copied to clipboard!', 'success');
                setTimeout(() => btn.classList.remove('copied'), 2000);
            });
        }
    });

    // Share button
    document.getElementById('shareBtn').addEventListener('click', () => {
        if (currentLocation.digipin) {
            const url = `${window.location.origin}${window.location.pathname}?pin=${currentLocation.digipin}`;

            if (navigator.share) {
                navigator.share({
                    title: 'DigiPIN Location',
                    text: `My DigiPIN is ${currentLocation.digipin}`,
                    url: url
                });
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Share link copied to clipboard!', 'success');
                });
            }
        }
    });

    // Navigate button
    document.getElementById('navigateBtn').addEventListener('click', () => {
        if (currentLocation.lat && currentLocation.lon) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentLocation.lat},${currentLocation.lon}`, '_blank');
        }
    });
}

// ========================================
// Search Functionality
// ========================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const locateBtn = document.getElementById('locateBtn');

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    locateBtn.addEventListener('click', locateUser);
}

async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();

    if (!query) {
        showToast('Please enter a DigiPIN or address', 'error');
        return;
    }

    // Check if it's a DigiPIN
    if (isValidDigipin(query)) {
        const decoded = decodeDigipin(query);
        if (decoded) {
            setLocation(decoded.lat, decoded.lon, 18);
            showToast('DigiPIN located!', 'success');
            return;
        }
    }

    // Try geocoding (address search)
    try {
        showToast('Searching...', 'success');
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            setLocation(parseFloat(lat), parseFloat(lon), 16);
            showToast(`Found: ${data[0].display_name.split(',')[0]}`, 'success');
        } else {
            showToast('Location not found. Try a different search.', 'error');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        showToast('Search failed. Please try again.', 'error');
    }
}

function locateUser() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        return;
    }

    showToast('Getting your location...', 'success');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            if (!isWithinBounds(latitude, longitude)) {
                showToast('Your location is outside DigiPIN coverage (India)', 'error');
                return;
            }

            setLocation(latitude, longitude, 18);
            showToast('Location found!', 'success');
        },
        (error) => {
            console.error('Geolocation error:', error);
            showToast('Could not get your location. Please check permissions.', 'error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ========================================
// URL State Management
// ========================================
function initUrlHandler() {
    const params = new URLSearchParams(window.location.search);

    // Handle ?pin=XXX-XXX-XXXX
    const pin = params.get('pin');
    if (pin && isValidDigipin(pin)) {
        const decoded = decodeDigipin(pin);
        if (decoded) {
            setTimeout(() => setLocation(decoded.lat, decoded.lon, 18, false), 500);
            return;
        }
    }

    // Handle ?lat=...&lng=... or ?lat=...&lon=...
    const lat = parseFloat(params.get('lat'));
    const lon = parseFloat(params.get('lng') || params.get('lon'));
    if (!isNaN(lat) && !isNaN(lon) && isWithinBounds(lat, lon)) {
        setTimeout(() => setLocation(lat, lon, 18, false), 500);
        return;
    }

    // Handle ?q=address
    const query = params.get('q');
    if (query) {
        document.getElementById('searchInput').value = query;
        setTimeout(handleSearch, 500);
    }
}

function updateUrlState(type, value) {
    const url = new URL(window.location);

    // Clear existing params
    url.searchParams.delete('pin');
    url.searchParams.delete('lat');
    url.searchParams.delete('lng');
    url.searchParams.delete('lon');
    url.searchParams.delete('q');

    if (type === 'pin' && value) {
        url.searchParams.set('pin', value);
    }

    history.replaceState(null, '', url.toString());
}

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toast.classList.remove('success', 'error');
    toast.classList.add(type);
    toastMessage.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMap();
    initSearch();
    initResultPanel();
    initUrlHandler();
});
