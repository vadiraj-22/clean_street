// src/utils/useGeolocation.js
// Custom hook for getting current location and reverse-geocoding to city name

import { useState, useCallback } from "react";

/**
 * Reverse geocodes coordinates using OpenStreetMap Nominatim (free, no API key needed).
 * Returns an object with city, state, country, and a formatted display string.
 */
export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();

  const addr = data.address || {};

  // Most specific to least specific — pick the best city-level name
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    addr.state_district ||
    "";
  const state = addr.state || "";
  const country = addr.country || "";

  // Build a detailed, human-readable full address
  // Include neighbourhood/suburb, road, ward/quarter, city, state, postcode
  const fullAddressParts = [
    addr.house_number,
    addr.road || addr.pedestrian || addr.footway,
    addr.neighbourhood || addr.suburb || addr.quarter,
    addr.city_district || addr.county_code,
    city,
    addr.postcode,
    state,
  ].filter(Boolean);

  const fullAddress = fullAddressParts.join(", ");

  // Shorter display string (city + state)
  const displayLocation = [city, state].filter(Boolean).join(", ");

  return { city, state, country, displayLocation, fullAddress, raw: data };
};

/**
 * useGeolocation hook
 * Returns { detectLocation, locationLoading, locationError }
 * Call detectLocation(onSuccess) — onSuccess receives { lat, lng, city, state, displayLocation }
 */
const useGeolocation = () => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const detectLocation = useCallback(async (onSuccess) => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const geoData = await reverseGeocode(lat, lng);
          onSuccess({ lat, lng, ...geoData });
        } catch (err) {
          setLocationError("Could not determine city from your location.");
          // Still pass coordinates so the map can use them
          onSuccess({ lat, lng, city: "", state: "", displayLocation: "" });
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location access denied. Please allow location in your browser.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred while getting location.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { detectLocation, locationLoading, locationError, setLocationError };
};

export default useGeolocation;
