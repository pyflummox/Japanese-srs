import React, { useEffect, useState } from 'react'

function App() {
  const [words, setWords] = useState([])

  useEffect(() => {
    fetch('/api/v1/words')
      .then(res => res.json())
      .then(setWords)
  }, [])

  return (
    <div>
      <h1>Japanese SRS</h1>
      <ul>
        {words.map(w => (
          <li key={w.id}>{w.japanese} - {w.english}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
