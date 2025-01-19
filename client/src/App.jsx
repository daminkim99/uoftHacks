import React from 'react'
import {Outlet} from 'react-router-dom'
import './App.css'
import logo from './assets/logo.png'


function App() {
  
  return(
    <div className="body">
      <div className='logo'>
        <a href="/">
        <header>
          <img src={logo} alt="logo" className='logo'/>
        </header>
        </a>
      </div>
        <main>
          <Outlet/>
        </main>
    </div>
  )
}


export default App
