import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Search,
  MapPin,
  Phone,
  Navigation,
  Filter,
  AlertCircle,
  Building2,
  Clock,
  Star,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';
import useGeolocation from '../hooks/useGeolocation';
import { hospitalService } from '../services/hospitalService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';

// Fix for default Leaflet marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Hospital & Clinic Leaflet Icons
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const clinicIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Recenter Map Component
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
}

// Distance Calculation Helper (Haversine formula in KM)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

export default function HospitalFinderPage() {
  const { location: userGeoLocation } = useGeolocation();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.0538, 72.5085]); // Ahmedabad default
  const [detailModalHospital, setDetailModalHospital] = useState(null);

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await hospitalService.getHospitals({
        type: typeFilter !== 'All' ? typeFilter : undefined,
        emergency: emergencyOnly ? 'true' : undefined,
        search: searchQuery || undefined,
        specialty: specialtyFilter || undefined
      });
      const data = res.data || [];
      setHospitals(data);
      if (data.length > 0 && data[0].location?.coordinates) {
        setMapCenter([data[0].location.coordinates[1], data[0].location.coordinates[0]]);
      }
    } catch (err) {
      console.error('Fetch hospitals error:', err);
      setError('Unable to load hospitals and clinics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [typeFilter, emergencyOnly, specialtyFilter]);

  // Update map center when user location is available
  useEffect(() => {
    if (userGeoLocation?.latitude && userGeoLocation?.longitude) {
      setMapCenter([userGeoLocation.latitude, userGeoLocation.longitude]);
    }
  }, [userGeoLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const handleSelectOnMap = (hospital) => {
    setSelectedHospital(hospital);
    if (hospital.location?.coordinates) {
      setMapCenter([hospital.location.coordinates[1], hospital.location.coordinates[0]]);
    }
  };

  const userLat = userGeoLocation?.latitude || 23.0538;
  const userLng = userGeoLocation?.longitude || 72.5085;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#3D5A45] bg-[#eef3ef] px-3 py-1 rounded-full mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Healthcare Discovery Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hospitals & Clinics Finder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Locate verified emergency centers, geriatric specialists, and senior wellness clinics
          </p>
        </div>

        {/* Emergency filter toggle */}
        <button
          onClick={() => setEmergencyOnly(!emergencyOnly)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
            emergencyOnly 
              ? 'bg-[#D90429] text-white border-[#D90429] shadow-sm animate-pulse' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>24/7 Emergency Only</span>
        </button>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital name, doctor specialty, city, or address..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px] mr-1">Type:</span>
          {['All', 'Hospital', 'Clinic'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-[#3D5A45] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {type === 'All' ? 'All Facilities' : `${type}s`}
            </button>
          ))}

          <span className="text-gray-300 mx-1">|</span>

          {['Geriatrics', 'Cardiology', 'Orthopedics', 'General Medicine'].map(spec => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(specialtyFilter === spec ? '' : spec)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                specialtyFilter === spec
                  ? 'bg-[#E07A5F] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Split View: Map + Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Hospital Cards List */}
        <div className="lg:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
            <span>Found {hospitals.length} Healthcare Facilities</span>
            <span>Sorted by Distance & Emergency Care</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-44 w-full rounded-2xl" />)}
            </div>
          ) : hospitals.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-800">No Facilities Found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No hospitals or clinics matched your search or filters. Try clearing your filters.
              </p>
              <button
                onClick={() => {
                  setTypeFilter('All');
                  setEmergencyOnly(false);
                  setSearchQuery('');
                  setSpecialtyFilter('');
                  fetchHospitals();
                }}
                className="mt-4 px-4 py-2 bg-[#3D5A45] text-white text-xs font-semibold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            hospitals.map((h) => {
              const distanceKm = h.location?.coordinates 
                ? calculateDistance(userLat, userLng, h.location.coordinates[1], h.location.coordinates[0])
                : null;
              const isSelected = selectedHospital?._id === h._id;

              return (
                <div
                  key={h._id}
                  onClick={() => handleSelectOnMap(h)}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-[#3D5A45] ring-2 ring-[#3D5A45]/20 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Name + Type Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-extrabold text-gray-900 text-base">{h.name}</h3>
                          {h.rating && (
                            <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                              {h.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0" />
                          <span>{h.address}</span>
                        </p>
                      </div>

                      {/* Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${
                        h.type === 'Hospital' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {h.type}
                      </span>
                    </div>

                    {/* Middle Info: Specialties */}
                    {h.specialties && h.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {h.specialties.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Emergency Status & Hours */}
                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded-xl mb-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{h.openingHours || '24/7 Open'}</span>
                      </span>
                      {distanceKm && (
                        <span className="font-bold text-[#3D5A45]">
                          ~{distanceKm} km away
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${h.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 px-3 bg-[#eef3ef] hover:bg-[#d8e6dc] text-[#3D5A45] rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Facility</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.location?.coordinates ? `${h.location.coordinates[1]},${h.location.coordinates[0]}` : encodeURIComponent(h.name + ' ' + h.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 px-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModalHospital(h);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Map View */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm h-[400px] lg:h-[750px] relative z-10">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <ChangeMapView coords={mapCenter} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User Location Marker */}
              {userGeoLocation?.latitude && userGeoLocation?.longitude && (
                <Marker 
                  position={[userGeoLocation.latitude, userGeoLocation.longitude]}
                  icon={userLocationIcon}
                >
                  <Popup>
                    <div className="text-center p-1">
                      <strong className="text-blue-600">Your Current Location</strong>
                      <p className="text-xs text-gray-500 mt-0.5">GPS Proximity Active</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Hospital & Clinic Markers */}
              {hospitals.map((h) => {
                if (!h.location?.coordinates || h.location.coordinates.length < 2) return null;
                const pos = [h.location.coordinates[1], h.location.coordinates[0]];
                const isHospital = h.type === 'Hospital';

                return (
                  <Marker
                    key={h._id}
                    position={pos}
                    icon={isHospital ? hospitalIcon : clinicIcon}
                    eventHandlers={{
                      click: () => setSelectedHospital(h)
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[180px]">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isHospital ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {h.type}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{h.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{h.address}</p>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                          <a href={`tel:${h.phone}`} className="text-xs text-[#3D5A45] font-bold">
                            📞 Call
                          </a>
                          <button
                            onClick={() => setDetailModalHospital(h)}
                            className="text-xs text-blue-600 font-bold"
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

      </div>

      {/* 4. Hospital Detail Modal */}
      {detailModalHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                  detailModalHospital.type === 'Hospital' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {detailModalHospital.type}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-1">
                  {detailModalHospital.name}
                </h3>
              </div>
              <button 
                onClick={() => setDetailModalHospital(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <strong className="block text-xs uppercase text-gray-400 font-bold mb-1">Full Address</strong>
                <p className="text-gray-800">{detailModalHospital.address}, {detailModalHospital.city}, {detailModalHospital.state} - {detailModalHospital.pincode}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Emergency Care:</span>
                  <p className="font-bold text-gray-900">{detailModalHospital.emergencyAvailable ? '✅ 24/7 Active' : '❌ Routine Care Only'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Opening Hours:</span>
                  <p className="font-bold text-gray-900">{detailModalHospital.openingHours}</p>
                </div>
              </div>

              {detailModalHospital.specialties && (
                <div>
                  <strong className="block text-xs uppercase text-gray-400 font-bold mb-1.5">Specialties & Departments</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {detailModalHospital.specialties.map((s, i) => (
                      <span key={i} className="bg-[#eef3ef] text-[#3D5A45] font-semibold text-xs px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detailModalHospital.services && (
                <div>
                  <strong className="block text-xs uppercase text-gray-400 font-bold mb-1.5">Available Facilities</strong>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    {detailModalHospital.services.map((srv, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5A45]" />
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex space-x-3">
              <a
                href={`tel:${detailModalHospital.phone}`}
                className="flex-1 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call {detailModalHospital.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
