import React, { useEffect } from 'react';
import AppRouter from './routes';
import './index.css';
import { useAppDispatch, useAppSelector } from './features/hooks';
import { initializeAuth } from './features/auth/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/5">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppRouter />
  );
}

export default App;
