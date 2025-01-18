import React from 'react'
import {Outlet} from 'react-router-dom'


function App() {
  
  return(
    <div>
      <header>
      <a href="/">Logo</a> |
      </header>
      <main>
        <Outlet/>
      </main>
    </div>
  )
}


export default App
