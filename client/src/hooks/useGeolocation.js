import { useState, useCallback } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = useCallback(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { ...location, error, loading, getCurrentPosition };
};

export default useGeolocation;
