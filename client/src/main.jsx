import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter as Router,Route,Routes } from 'react-router-dom'
import App from './App.jsx'
import Keyword from './pages/Keyword.jsx'
import Landing from './pages/Landing.jsx'
import TextEditor from './pages/TextEditor.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path='/' element={<App/>}>
        <Route index element={<Landing/>}/>
        <Route path="keyword" element={<Keyword/>}/>
        <Route path="landing" element={<Landing/>}/>
        <Route path="textEditor" element={<TextEditor/>}/>
      </Route>
    </Routes>
  </Router>
)