import React, { useState } from 'react'

function ReviewCard({word, onReview}) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const correct = answer.trim() === word.english.toLowerCase()
    onReview(word.id, correct)
    setAnswer('')
  }

  return (
    <div>
      <p>{word.japanese}</p>
      <form onSubmit={handleSubmit}>
        <input value={answer} onChange={e => setAnswer(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default ReviewCard
