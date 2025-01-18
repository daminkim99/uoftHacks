import React from 'react'
import {Outlet} from 'react-router-dom'


function App() {
  
  return(
    <div>
      <header>
      <a href="/">MainPage</a> |
      <a href="/keyword">Keyword</a> |
      <a href="/TextEditor">TextEditor</a>
      </header>
      <main>
        <Outlet/>
      </main>
    </div>
  )
}

export default App
