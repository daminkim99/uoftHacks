import React from 'react'
import {Outlet} from 'react-router-dom'
import './App.css'


function App() {
  
  return(
    <div className="body">
      <div className='logo'>
        <a href="/">
        <header>
        Logo
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
