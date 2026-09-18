import React from 'react';
import { Building2, MapPin, Phone, ShieldCheck, Navigation2 } from 'lucide-react';

const ClinicCard = ({ hospital, onDirections }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{hospital.name}</h3>
              {hospital.distance && (
                <span className="inline-flex items-center text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {hospital.distance} away
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2">{hospital.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <p>{hospital.phone}</p>
          </div>
          {hospital.hasEmergency && (
            <div className="flex items-center gap-2 text-green-600 font-medium pt-1">
              <ShieldCheck className="h-4 w-4" />
              <p>24/7 Emergency Available</p>
            </div>
          )}
        </div>

        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {hospital.specialties.slice(0, 3).map((spec, idx) => (
              <span key={idx} className="text-[10px] font-medium uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {spec}
              </span>
            ))}
            {hospital.specialties.length > 3 && (
              <span className="text-[10px] font-medium text-gray-500 px-1 py-1">
                +{hospital.specialties.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-3 grid grid-cols-2 gap-3">
        <a 
          href={`tel:${hospital.phone.replace(/\D/g,'')}`}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Phone className="h-4 w-4 text-primary-600" />
          Call
        </a>
        <button 
          onClick={() => onDirections && onDirections(hospital)}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Navigation2 className="h-4 w-4" />
          Directions
        </button>
      </div>
    </div>
  );
};

export default ClinicCard;
