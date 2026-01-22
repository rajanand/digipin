# DigiPIN Web App

[![Official Site](https://img.shields.io/badge/Official-DigiPIN-red)](https://dac.indiapost.gov.in/mydigipin/home)
![License](https://img.shields.io/badge/License-Open%20Source-blue)

A modern, fast, and interactive web application to find and share **DigiPINs** (Digital Postal Index Numbers) across India. This tool provides a high-precision digital addressing system that pinpoints any location with **4x4 meter accuracy**.

## 🚀 Live Demo
Check out the tool here: [Find Your DigiPIN](https://projects.rajanand.org/digipin)

---

## 📍 What is DigiPIN?

**DigiPIN** is a revolutionary geo-coded digital addressing system developed by **India Post** in collaboration with **IIT Hyderabad** and **ISRO's National Remote Sensing Centre (NRSC)**.

### Key Highlights:
- **Precision**: Divides India into a hierarchical grid, reaching a final resolution of approx. **3.8m x 3.8m**.
- **10 Characters**: A unique 10-character alphanumeric code for every spot in India.
- **Smart Symbol Set**: Uses 16 unique symbols (2-9, C, F, J, K, L, M, P, T) chosen to avoid visual and phonetic confusion.
- **Offline Capable**: The algorithm is purely mathematical and does not require an internet connection for transformation.

---

## ✨ Features

- **Interactive Map**: Built with Leaflet.js for smooth exploration.
- **Instant Encoding**: Click anywhere on India to get its unique DigiPIN.
- **Search Support**: 
  - Search by DigiPIN (e.g., `4P3-JM8-K4L6`)
  - Search by Address (via Nominatim Geocoding)
  - Direct Lat/Long input.
- **URL Parameters**: Access any location directly via URL (e.g., `?pin=XXX-XXX-XXXX`).
- **Dark/Light Mode**: Full theme support with persistent preferences.
- **Geolocation**: Quickly find your own DigiPIN using browser location services.
- **Mobile Responsive**: Fully optimized for phones and tablets.
- **"How It Works"**: Comprehensive technical documentation built into the app.

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES6+)
- **Map Engine**: [Leaflet.js](https://leafletjs.com/)
- **Styling**: Vanilla CSS (Custom Design System with Glassmorphism)
- **Deployment**: Optimized for Static Hosting (GitHub Pages / Vercel)

---

## 📂 Project Structure

```bash
├── about/
│   └── index.html    # Technical documentation & About page
├── digipin.js        # Core DigiPIN algorithm implementation
├── main.js           # Main app logic and UI handling
├── index.html        # Main landing page
├── style.css         # Custom design system and components
└── README.md         # You are here
```

---

## 🛠️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rajanand/digipin.git
   cd digipin
   ```

2. **Run a local server**:
   Since it's a static site, you can use any local server. For example, using Python or Node.js:
   ```bash
   # Using Node (npx)
   npx http-server
   
   # Using Python
   python -m http.server
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:8080` (or the port provided).

---

## 📜 Official Resources

- [Official DigiPIN Portal](https://dac.indiapost.gov.in/mydigipin/home)
- [India Post Official Github](https://github.com/INDIAPOST-gov/digipin)
- [Open Standard Documentation](https://www.indiapost.gov.in/)

## ⚖️ Disclaimer

This is an **unofficial** tool built to help users easily find and share their DigiPINs. The DigiPIN standard and algorithm are properties of India Post, Government of India.

---

Built with ❤️ for a Digital India.
