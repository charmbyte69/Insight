import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Homepage from './Components/Homepage'
import Login from './Components/Login'
import Register from './Components/Register'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Homepage />} />
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        {/* Register Page */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App