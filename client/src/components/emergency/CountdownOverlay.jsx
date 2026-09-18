import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, MapPin, X, Users } from 'lucide-react';

const CountdownOverlay = ({ 
  countdown, 
  eventType = 'Medical Emergency', 
  onCancel, 
  location,
  contactedPeople = [] 
}) => {
  const isComplete = countdown <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-emergency flex flex-col items-center justify-center p-6"
      >
        <div className="absolute top-12 flex flex-col items-center">
          <div className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 mb-4">
            <AlertOctagon className="h-5 w-5 text-white" />
            <span className="text-white font-semibold uppercase tracking-wider">{eventType}</span>
          </div>
          
          {location && (
            <div className="flex items-center gap-1.5 text-red-100 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Location acquired: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md text-center mt-12">
          {!isComplete ? (
            <>
              <h2 className="text-2xl font-medium text-red-100 mb-8">Sending alert in</h2>
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-[120px] leading-none font-bold text-white mb-12 tabular-nums"
              >
                {countdown}
              </motion.div>
              
              <button
                onClick={onCancel}
                className="mt-8 px-12 py-4 bg-white text-emergency rounded-full font-bold text-xl shadow-xl hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2"
              >
                <X className="h-6 w-6" />
                CANCEL SOS
              </button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center w-full"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <AlertOctagon className="h-12 w-12 text-emergency" />
                </motion.div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Alert Sent</h2>
              <p className="text-xl text-red-100 mb-12">Help is on the way.</p>
              
              {contactedPeople.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left border border-white/20">
                  <h3 className="flex items-center text-white font-semibold mb-4 gap-2 border-b border-white/20 pb-2">
                    <Users className="h-5 w-5" />
                    Notified Contacts
                  </h3>
                  <ul className="space-y-3">
                    {contactedPeople.map((person, idx) => (
                      <li key={idx} className="flex items-center justify-between text-red-50">
                        <span>{person.name}</span>
                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-white">{person.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CountdownOverlay;
