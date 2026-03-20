import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LETTERS = ['W', 'A', 'B', 'I']

const ENTRY_STAGGER = 0.08
const DROP_STAGGER = 0.1
const JOIN_TO_DROP_DELAY_MS = 1700

const WabiEntrance = ({ onComplete }) => {
  const [phase, setPhase] = useState('join')

  const startDropPhase = () => setPhase('drop')

  useEffect(() => {
    const joinTimer = window.setTimeout(startDropPhase, JOIN_TO_DROP_DELAY_MS)

    const completeTimer = window.setTimeout(
      () => onComplete?.(),
      JOIN_TO_DROP_DELAY_MS + 700 + (LETTERS.length - 1) * DROP_STAGGER * 1000
    )

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) > 2) {
        startDropPhase()
      }
    }

    const handleTouchMove = () => {
      startDropPhase()
    }

    const handleKeyDown = (event) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(event.key)) {
        startDropPhase()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(joinTimer)
      window.clearTimeout(completeTimer)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onComplete])

  return (
    <motion.section className="wabi-entrance">
      <p className="entrance-kicker">Wabi Portfolio</p>
      <div className="wabi-word" aria-label="Wabi animated title">
        {LETTERS.map((letter, index) => (
          <motion.span
            key={letter}
            className="wabi-letter"
            initial={{
              y: '-110vh',
              opacity: 0,
              rotate: index % 2 === 0 ? -10 : 10,
            }}
            animate={
              phase === 'drop'
                ? {
                    y: '115vh',
                    x: `${(index - (LETTERS.length - 1) / 2) * 3.2}rem`,
                    opacity: 0,
                    rotate: index % 2 === 0 ? -14 : 14,
                  }
                : { x: 0, y: 0, opacity: 1, rotate: 0 }
            }
            transition={
              phase === 'drop'
                ? { duration: 0.72, delay: index * DROP_STAGGER, ease: [0.2, 0.8, 0.3, 1] }
                : {
                    type: 'spring',
                    stiffness: 100,
                    damping: 12,
                    delay: index * ENTRY_STAGGER,
                  }
            }
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <p className="entrance-hint">Loading Gemini experience...</p>
    </motion.section>
  )
}

export default WabiEntrance
