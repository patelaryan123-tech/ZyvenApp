import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../config/firebase';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let newSocket;

    const initSocket = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
          auth: {
            token
          }
        });

        newSocket.on('connect', () => setConnected(true));
        newSocket.on('disconnect', () => setConnected(false));
        
        setSocket(newSocket);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        initSocket();
      } else if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    });

    return () => {
      unsubscribe();
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const emit = (event, data) => {
    if (socket) socket.emit(event, data);
  };

  const on = (event, callback) => {
    if (socket) socket.on(event, callback);
  };

  const off = (event, callback) => {
    if (socket) socket.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket, connected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
