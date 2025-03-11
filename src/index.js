import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/App.css';
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from 'react-redux';
import {store } from './Redux/store';


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}> 
    <AuthProvider>
      <App />
    </AuthProvider>,
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);