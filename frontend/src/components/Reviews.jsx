import React, { useEffect, useState } from 'react'
import ReviewCard from './ReviewCard'

function Reviews() {
  const [words, setWords] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch('/api/v1/reviews')
      .then(res => res.json())
      .then(setWords)
      .catch(console.error)
  }, [])

  const handleReview = (id, correct) => {
    fetch('/api/v1/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_id: id, correct })
    }).then(() => {
      setCurrent(c => c + 1)
    })
  }

  if (!words.length) return <div>Loading...</div>
  if (current >= words.length) return <div>No more reviews</div>

  return (
    <div>
      <h2>Reviews</h2>
      <ReviewCard word={words[current]} onReview={handleReview} />
    </div>
  )
}

export default Reviews
