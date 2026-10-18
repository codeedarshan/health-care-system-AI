import React, { useState, useEffect } from "react";
import { 
  MapPin, Search, Phone, Star, ShieldAlert, Sparkles, 
  Clock, Navigation, Shield, HeartPulse, Compass, RefreshCw 
} from "lucide-react";
import { Hospital } from "../types";

export default function HospitalView() {
  const [city, setCity] = useState("Ahmedabad");
  const [symptomQuery, setSymptomQuery] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  // Geolocation & GPS tracking variables
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsType, setGpsType] = useState<"GPS" | "IP" | "None">("None");
  const [customCities, setCustomCities] = useState<string[]>([]);

  const fetchHospitals = async (cityVal: string, queryVal: string, latVal?: number | null, lngVal?: number | null) => {
    setLoading(true);
    try {
      const response = await fetch("/api/suggest-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          city: cityVal, 
          symptomQuery: queryVal,
          latitude: latVal !== undefined ? latVal : latitude,
          longitude: lngVal !== undefined ? lngVal : longitude
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const fetched = data.hospitals || [];
        const customSaved = localStorage.getItem("healthfem_custom_hospitals");
        let merged = [...fetched];
        if (customSaved) {
          const customList: Hospital[] = JSON.parse(customSaved);
          // Match by city name (case-insensitive)
          const cityCustom = customList.filter(h => h.city.toLowerCase() === cityVal.toLowerCase());
          merged = [...cityCustom, ...merged];
        }
        setHospitals(merged);
        if (data.aiAdvice) {
          setAiAdvice(data.aiAdvice);
        }
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals(city, "");
  }, [city]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals(city, symptomQuery);
  };

  const handleDetectLocation = () => {
    setError(null);
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser. Please search by selecting a city manually.");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setGpsActive(true);
        setGpsType("GPS");

        try {
          // Reverse geocode to find exact local city name
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          const data = await res.json();
          if (data && data.address) {
            const detected = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || data.address.state_district || "Mumbai";
            const cleanCityName = detected.replace(/\s+(District|City|Division|Taluk|Subdivision)/gi, "").trim();
            
            const defaultCities = ["Ahmedabad", "Surat", "Mumbai", "Pune", "Bengaluru", "Delhi"];
            if (!defaultCities.includes(cleanCityName) && !customCities.includes(cleanCityName)) {
              setCustomCities(prev => [...prev, cleanCityName]);
            }
            setCity(cleanCityName);
            await fetchHospitals(cleanCityName, symptomQuery, lat, lng);
          } else {
            const closest = findClosestDefaultCity(lat, lng);
            setCity(closest);
            await fetchHospitals(closest, symptomQuery, lat, lng);
          }
        } catch (err) {
          console.error("Nominatim reverse geocode failed, fallback to closest default:", err);
          const closest = findClosestDefaultCity(lat, lng);
          setCity(closest);
          await fetchHospitals(closest, symptomQuery, lat, lng);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.warn("GPS failed, attempting IP Geolocation backup:", error);
        fetch("https://ipapi.co/json/")
          .then(res => res.json())
          .then(async (ipData) => {
            if (ipData && ipData.city && ipData.latitude && ipData.longitude) {
              const cleanCityName = ipData.city;
              setLatitude(ipData.latitude);
              setLongitude(ipData.longitude);
              setGpsActive(true);
              setGpsType("IP");

              const defaultCities = ["Ahmedabad", "Surat", "Mumbai", "Pune", "Bengaluru", "Delhi"];
              if (!defaultCities.includes(cleanCityName) && !customCities.includes(cleanCityName)) {
                setCustomCities(prev => [...prev, cleanCityName]);
              }
              setCity(cleanCityName);
              await fetchHospitals(cleanCityName, symptomQuery, ipData.latitude, ipData.longitude);
            } else {
              const cities = ["Ahmedabad", "Surat", "Mumbai", "Pune", "Bengaluru", "Delhi"];
              const randomCity = cities[Math.floor(Math.random() * cities.length)];
              setCity(randomCity);
              await fetchHospitals(randomCity, symptomQuery, null, null);
            }
          })
          .catch(() => {
            const cities = ["Ahmedabad", "Surat", "Mumbai", "Pune", "Bengaluru", "Delhi"];
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            setCity(randomCity);
            fetchHospitals(randomCity, symptomQuery, null, null);
          })
          .finally(() => {
            setDetectingLocation(false);
          });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const findClosestDefaultCity = (lat: number, lng: number): string => {
    const coords: Record<string, {lat: number, lng: number}> = {
      "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
      "Surat": { lat: 21.1702, lng: 72.8311 },
      "Mumbai": { lat: 19.0760, lng: 72.8777 },
      "Pune": { lat: 18.5204, lng: 73.8567 },
      "Bengaluru": { lat: 12.9716, lng: 77.5946 },
      "Delhi": { lat: 28.7041, lng: 77.1025 }
    };

    let closest = "Ahmedabad";
    let minDistance = Infinity;
    for (const [name, coord] of Object.entries(coords)) {
      const dist = Math.sqrt(Math.pow(lat - coord.lat, 2) + Math.pow(lng - coord.lng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closest = name;
      }
    }
    return closest;
  };

  // Get unique list of specialties for dropdown filter
  const allSpecialties = Array.from(
    new Set(hospitals.flatMap(h => h.specialties))
  ).sort();

  // Filtered hospital list
  const filteredHospitals = hospitals.filter(h => {
    if (emergencyOnly && !h.hasEmergency) return false;
    if (specialtyFilter !== "all" && !h.specialties.includes(specialtyFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6" id="hospital-finder-view">
      
      {/* Title & Introduction Banner */}
      <div className="bg-gradient-to-r from-red-500/10 via-blue-500/5 to-transparent p-6 rounded-3xl border border-red-500/20 dark:border-red-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="hospital-header-banner">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-500 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md">Emergency & Trauma Assistance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            AI-Guided Hospital Locator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Find the nearest medical facilities, trauma centers, and clinical specialties. Input your immediate symptoms or medical complaint, and let our health companion suggest the ideal department and pre-arrival triage directives.
          </p>
        </div>
        <div className="flex space-x-2 shrink-0 w-full sm:w-auto">
          <button 
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-xs"
            id="detect-location-btn"
          >
            <Compass className={`${detectingLocation ? "animate-spin text-[#DC2626]" : "text-[#DC2626]"}`} size={14} />
            <span>{detectingLocation ? "Locating..." : "Auto-Detect My City"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="hospital-body-grid">
        
        {/* Left Column (5 Cols): Search & AI Triage Advice */}
        <div className="lg:col-span-5 space-y-6" id="hospital-search-column">
          
          {/* Location & Symptom Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4" id="search-card">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <Search className="text-[#DC2626]" size={18} />
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">Find Specialised Care</h2>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4" id="hospital-query-form">
              {error && (
                <div className="p-3 bg-[#DC2626] text-white border border-[#DC2626] rounded-xl text-xs flex items-start space-x-2 animate-fade-in" id="hospital-error-banner">
                  <span className="bg-white text-[#DC2626] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0">NOTICE</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}
              {/* Select City */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Current City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                  >
                    <option value="Ahmedabad">Ahmedabad (અમદાવાદ / अहमदाबाद)</option>
                    <option value="Surat">Surat (સુરત / सूरत)</option>
                    <option value="Mumbai">Mumbai (मुंबई)</option>
                    <option value="Delhi">Delhi / NCR (दिल्ली)</option>
                    <option value="Pune">Pune (पुणे)</option>
                    <option value="Bengaluru">Bengaluru (बेंगलुरु)</option>
                    {customCities.map(c => (
                      <option key={c} value={c}>{c} (GPS Detected)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptom Context Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Describe Emergency/Symptoms (AI Triage)
                </label>
                <textarea
                  value={symptomQuery}
                  onChange={(e) => setSymptomQuery(e.target.value)}
                  placeholder="e.g. Dad has extreme pain in right chest radiating to jaw, sweating heavily..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626] resize-none"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Our AI will immediately scan for the correct department and formulate critical first-aid.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] dark:bg-[#DC2626] dark:hover:bg-[#B91C1C] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                id="search-hospitals-submit-btn"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                <span>{symptomQuery ? "Analyze Symptoms & Locate Clinics" : "Locate Nearby Clinics"}</span>
              </button>
            </form>
          </div>

          {/* AI Symptom Guidance Panel */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50/50 dark:from-slate-800/80 dark:to-slate-800/40 p-6 rounded-2xl border border-red-100 dark:border-slate-700 space-y-4 shadow-xs" id="ai-guidance-card">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-[#DC2626]" size={18} />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">AuraHealth AI Directives</h3>
            </div>
            
            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2" id="ai-loading">
                <RefreshCw className="animate-spin text-[#DC2626]" size={24} />
                <p className="text-xs font-bold text-slate-400">Consulting AuraHealth AI medical triage...</p>
              </div>
            ) : (
              <div className="space-y-3" id="ai-guidance-text-content">
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium pr-1">
                  {aiAdvice || "No active symptom report submitted yet. Type your symptoms above to get customized emergency first-aid recommendations, triage department direction, and professional pre-arrival guidelines."}
                </div>
                
                {symptomQuery && !loading && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[11px] text-red-600 dark:text-red-400 font-bold leading-normal flex items-start space-x-2" id="safety-disclaimer">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-500" />
                    <span>
                      Disclaimer: AI triage is for emergency direction. If symptoms are life-threatening, immediately call national numbers (102, 108) or proceed directly to the closest emergency room.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Dynamic Circular Radar & Hospital List */}
        <div className="lg:col-span-7 space-y-6" id="hospital-results-column">
          
          {/* Circular Radar Visualizer Panel */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden" id="hospital-radar-panel">
            <div className="space-y-2.5 max-w-xs text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <div className="inline-flex items-center space-x-1 bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping mr-1"></span>
                  <span>Active Radar Live</span>
                </div>
                {gpsActive && (
                  <div className="inline-flex items-center space-x-1 bg-blue-500/15 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/25 text-[9px] font-bold">
                    <span>{gpsType} Lock Active</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-base tracking-tight font-sans text-slate-100">Scanning {city} Sector</h3>
              <p className="text-xs text-slate-400 leading-normal font-medium">
                Visualizing medical units, specialized cardiac ICUs and trauma units detected within 10 km.
              </p>
              
              {gpsActive && latitude && longitude && (
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-left space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest flex items-center justify-between">
                    <span>Target Coordinates</span>
                    <span className="text-blue-400 animate-pulse">● Connected</span>
                  </div>
                  <div className="font-mono text-[10px] text-red-400 font-bold">
                    Lat: {latitude.toFixed(5)}° N <br />
                    Lng: {longitude.toFixed(5)}° E
                  </div>
                  <div className="text-[9px] text-slate-500 font-semibold italic">
                    Accurate georeferencing calibrated using {gpsType === "GPS" ? "device telemetry" : "network IP lookup"}.
                  </div>
                </div>
              )}

              <div className="text-[11px] font-bold text-red-400 pt-1">
                Found {filteredHospitals.length} clinical centers matching filters
              </div>
            </div>

            {/* Simulated Scanning Radar UI */}
            <div className="relative w-40 h-40 flex items-center justify-center rounded-full border border-red-500/20 shrink-0" id="radar-ring">
              {/* Spinning sweeps */}
              <div className="absolute inset-0 rounded-full border border-red-500/10 animate-pulse"></div>
              <div className="absolute w-32 h-32 rounded-full border border-red-500/15"></div>
              <div className="absolute w-20 h-20 rounded-full border border-red-500/20"></div>
              <div className="absolute w-1 h-1 bg-red-500 rounded-full"></div>
              
              {/* Glowing sweeping light */}
              <div className="absolute inset-0 rounded-full border-t border-l border-red-500/40 animate-spin" style={{ animationDuration: "5s" }}></div>
              <div className="absolute inset-1 rounded-full border-b border-r border-red-500/20 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }}></div>

              {/* Plot dots matching listed hospitals */}
              {filteredHospitals.slice(0, 5).map((h, index) => {
                let x = 0;
                let y = 0;
                
                if (latitude && longitude && h.latitude && h.longitude) {
                  // True Geographic Plotting relative to GPS center
                  const deltaLat = h.latitude - latitude;
                  const deltaLng = h.longitude - longitude;
                  const angle = Math.atan2(deltaLat, deltaLng);
                  const maxDist = Math.max(...filteredHospitals.map(item => item.distance), 5);
                  const r = 20 + (h.distance / maxDist) * 50; // proportional radius (20px to 70px)
                  x = Math.cos(angle) * r;
                  y = -Math.sin(angle) * r; // screen y coordinate is inverted
                } else {
                  // Fallback to high-tech circular distribution
                  const angles = [45, 120, 210, 290, 340];
                  const radiuses = [35, 55, 45, 65, 50];
                  const angle = (angles[index % 5]) * (Math.PI / 180);
                  const r = radiuses[index % 5];
                  x = Math.cos(angle) * r;
                  y = Math.sin(angle) * r;
                }
                
                return (
                  <div
                    key={h.id}
                    className="absolute w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_8px_#ef4444]"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    title={`${h.name} (${h.distance} km away)`}
                  >
                    <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters & Listing Cards */}
          <div className="space-y-4" id="hospitals-list-section">
            
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700" id="filter-bar">
              <div className="flex flex-wrap items-center gap-2">
                {/* Specialty dropdown filter */}
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="all">All Specialties (सभी विभाग)</option>
                  {allSpecialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Toggle emergency only */}
              <button
                onClick={() => setEmergencyOnly(!emergencyOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  emergencyOnly 
                    ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900" 
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
                id="emergency-filter-btn"
              >
                <ShieldAlert size={12} className="text-red-500" />
                <span>24/7 ICU Emergency Only</span>
              </button>
            </div>

            {/* Hospital Listing */}
            {loading ? (
              <div className="py-20 text-center space-y-3" id="list-loading">
                <RefreshCw className="animate-spin text-[#DC2626] mx-auto" size={32} />
                <p className="text-sm font-bold text-slate-400">Scanning and rendering clinical profiles...</p>
              </div>
            ) : filteredHospitals.length > 0 ? (
              <div className="space-y-4" id="hospital-list-container">
                {filteredHospitals.map((h) => (
                  <div 
                    key={h.id}
                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs transition-all space-y-4"
                    id={`hospital-card-${h.id}`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans leading-tight">
                            {h.name}
                          </h4>
                          {h.hasEmergency && (
                            <span className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-[9px] font-bold text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <ShieldAlert size={10} className="text-red-500 fill-red-500" />
                              <span>24/7 ICU ER</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center">
                          <MapPin size={12} className="mr-1 text-slate-400" />
                          {h.address}
                        </p>
                      </div>
                      
                      {/* Distance badge & rating */}
                      <div className="text-right shrink-0">
                        <div className="bg-red-50 dark:bg-slate-900 border border-red-100 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs font-bold text-[#DC2626] dark:text-red-400 flex items-center justify-center space-x-1">
                          <Navigation size={10} className="text-[#DC2626]" />
                          <span>{h.distance} km</span>
                        </div>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <Star className="text-orange-500 fill-orange-500" size={12} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{h.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specialty tags */}
                    <div className="flex flex-wrap gap-1.5" id="specialty-tags">
                      {h.specialties.map((spec, idx) => (
                        <span 
                          key={idx}
                          className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-lg"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Footer Contact & Navigation */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 gap-4 flex-col sm:flex-row">
                      <div className="flex items-center space-x-3 text-xs w-full sm:w-auto">
                        <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                          <Clock size={12} className="mr-1 text-slate-400" />
                          <span>{h.openStatus}</span>
                        </div>
                        <a 
                          href={`tel:${h.phone.replace(/\s+/g, "")}`}
                          className="flex items-center text-[#DC2626] dark:text-red-400 font-bold hover:underline"
                        >
                          <Phone size={12} className="mr-1" />
                          <span>{h.phone}</span>
                        </a>
                      </div>

                      <div className="flex space-x-2 w-full sm:w-auto shrink-0 justify-end">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ", " + h.city)}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="w-full sm:w-auto text-center text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#DC2626] dark:text-red-400 border border-red-100 dark:border-slate-700 px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-1"
                        >
                          <Navigation size={12} />
                          <span>Get Directions</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3" id="no-hospitals-placeholder">
                <MapPin className="text-slate-300 dark:text-slate-600 mx-auto" size={48} />
                <h4 className="font-bold text-slate-700 dark:text-slate-200">No medical units match selected criteria</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing some specialty filters or selecting "All Specialties" to view community clinics in the {city} sector.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
