import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/App.css';
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from 'react-redux';
import { store } from './Redux/store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// We'll handle socket initialization in App.js with useEffect
// No need to set up socket event handlers here

ReactDOM.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>,
  document.getElementById('root')
);