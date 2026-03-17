import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Homepage from './Components/Homepage'
import Login from './Components/Login'
import Register from './Components/Register'
import Dashboard from './Components/Dashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App