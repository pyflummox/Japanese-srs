import React, { useState } from 'react'
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
import Dictionary from './components/Dictionary'
import Account from './components/Account'

function App() {
  const [query, setQuery] = useState('')

  return (
    <Router>
      <nav>
        <h1>Japanese SRS</h1>
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Link to={`/search/${encodeURIComponent(query)}`}>Go</Link>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/lessons">Lessons</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/progress">Progress</Link></li>
          <li><Link to="/dictionary">Dictionary</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/account" element={<Account />} />
          <Route path="/search/:q" element={<Dictionary />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
