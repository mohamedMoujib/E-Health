import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExampleComponent from './components/ExampleComponent';
import SignIn from './pages/sign-in/sign-in';
import SignUp from './pages/sign-up/SignUp';
import ResetPassword from './pages/sign-in/components/ResetPassword';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/{token}" element={<ExampleComponent />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/ResetPassword/:token" element={<ResetPassword />} />
        <Route path="/logout" element={<SignIn />} />



      </Routes>
    </Router>
  );
}

export default App;