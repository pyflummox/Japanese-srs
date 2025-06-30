import React, { useEffect, useState } from 'react'

function Lessons() {
  const [words, setWords] = useState([])
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetch('/api/v1/words')
      .then(res => res.json())
      .then(setWords)
      .catch(console.error)
  }, [])

  const handleUpload = () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    fetch('/api/v1/import', { method: 'POST', body: formData })
      .then(() => window.location.reload())
  }

  return (
    <div>
      <h2>Lessons</h2>
      <div>
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload CSV</button>
      </div>
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
