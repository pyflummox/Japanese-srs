import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Dashboard() {
  const [summary, setSummary] = useState({
    total_words: 0,
    lessons_available: 0,
    reviews_due: 0
  })

  useEffect(() => {
    fetch('/api/v1/summary')
      .then(res => res.json())
      .then(setSummary)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card">
          <h3>Lessons</h3>
          <p>{summary.lessons_available}</p>
          <Link to="/lessons" className="button">Start</Link>
        </div>
        <div className="card">
          <h3>Reviews</h3>
          <p>{summary.reviews_due}</p>
          <Link to="/reviews" className="button">Start</Link>
        </div>
      </div>
      <p>Total Words: {summary.total_words}</p>
    </div>
  )
}

export default Dashboard
