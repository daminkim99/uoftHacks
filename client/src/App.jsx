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
<<<<<<< HEAD
          Logo
=======
          <img src={logo} alt="logo" className='logo'/>
>>>>>>> 50fd1c0e6139946c60e7a4a665bc9f0c6dda5a01
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
