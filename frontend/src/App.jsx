import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom'

import Dashboard from './components/Dashboard'
import Lessons from './components/Lessons'
import Reviews from './components/Reviews'
import Progress from './components/Progress'

function App() {
  return (
    <Router>
      <nav>
        <h1>Japanese SRS</h1>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/lessons">Lessons</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/progress">Progress</Link></li>
        </ul>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
