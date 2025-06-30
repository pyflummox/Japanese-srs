import React, { useEffect, useState } from 'react'

function Lessons() {
  const [words, setWords] = useState([])

  useEffect(() => {
    fetch('/api/v1/words')
      .then(res => res.json())
      .then(setWords)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>Lessons</h2>
      <div className="grid">
        {words.map(w => (
          <div key={w.id} className="card">
            {w.japanese} - {w.english}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Lessons
