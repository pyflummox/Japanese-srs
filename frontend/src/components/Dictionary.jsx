import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function Dictionary() {
  const [words, setWords] = useState([])
  const { q } = useParams()

  useEffect(() => {
    const url = q ? `/api/v1/search?q=${encodeURIComponent(q)}` : '/api/v1/dictionary'
    fetch(url)
      .then(res => res.json())
      .then(setWords)
      .catch(console.error)
  }, [q])

  return (
    <div>
      <h2>Dictionary</h2>
      <ul>
        {words.map(w => (
          <li key={w.id}>{w.japanese} - {w.english} ({w.jlpt})</li>
        ))}
      </ul>
    </div>
  )
}

export default Dictionary
