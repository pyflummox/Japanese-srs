import React, { useState } from 'react'

function Account() {
  const [maxLessons, setMaxLessons] = useState(15)
  const [theme, setTheme] = useState('light')

  return (
    <div>
      <h2>Account</h2>
      <label>Max items per lesson
        <input type="number" value={maxLessons} onChange={e => setMaxLessons(e.target.value)} />
      </label>
      <label>Theme
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  )
}

export default Account
