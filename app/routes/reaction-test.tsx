// app/routes/reaction-test.tsx
import { useEffect, useState, useCallback } from 'react'
import { FaBolt } from 'react-icons/fa'
import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => [{
  title: 'Reaction Test',
}]

export default function ReactionTestPage() {
  const [gameState, setGameState] = useState<
    'waiting' | 'reacting' | 'gameOver'
  >('waiting')
  const [isGreen, setIsGreen] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)

  const handleEarlyClick = () => {
    if (timeoutId !== null) window.clearTimeout(timeoutId)
    setGameState('gameOver')
    setReactionTime(-1)
    setIsGreen(false)
  }

  const startGame = useCallback(() => {
    setGameState('reacting')
    setIsGreen(false)
    setStartTime(null)
    setReactionTime(null)

    const randomTime = Math.floor(Math.random() * 4000) + 1000 // 1–5s
    const id = window.setTimeout(() => {
      setIsGreen(true)
      setStartTime(performance.now())
    }, randomTime)

    setTimeoutId(id)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [timeoutId])

  const handleClick = () => {
    if (!isGreen) {
      handleEarlyClick()
      return
    }
    if (startTime !== null) {
      const diff = Math.round(performance.now() - startTime)
      setReactionTime(diff)
      setGameState('gameOver')
      setIsGreen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-24">
      <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700/50">
        {gameState === 'waiting' && (
          <>
            <div className="flex items-center justify-center gap-4 mb-8">
              <FaBolt className="w-8 h-8 text-yellow-400 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Reaction Test
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 mb-4 text-center">
              Test your reaction speed!
            </p>
            <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700/30">
              <p className="text-gray-400 text-center">
                Wait for the red box to turn green, then click as quickly as you can.
                Click too early and you’ll fail!
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition"
              >
                Start Game
              </button>
            </div>
          </>
        )}

        {gameState === 'reacting' && (
          <button
            onClick={handleClick}
            aria-label={!isGreen ? 'Wait for green…' : 'CLICK!'}
            className={`h-48 sm:h-64 w-full rounded-2xl shadow-2xl transition-transform transform hover:scale-[1.02] active:scale-[0.98]
              ${
                isGreen
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/20'
                  : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20'
              }`}
          >
            <p className="text-white text-2xl sm:text-3xl font-bold">
              {!isGreen ? 'Wait for green…' : 'CLICK!'}
            </p>
          </button>
        )}

        {gameState === 'gameOver' && (
          <div role="dialog" aria-labelledby="gameover-heading" className="text-center space-y-6">
            <h2 id="gameover-heading" className="text-2xl sm:text-3xl font-bold text-gray-100">
              Game Over!
            </h2>

            {reactionTime === -1 ? (
              <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                <p className="text-xl text-red-400">
                  Too early! Wait for green next time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xl text-gray-300 mb-2">
                  Your reaction time was:
                </p>
                <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {reactionTime}ms
                </p>
                {reactionTime !== null && reactionTime < 200 && <p className="text-green-400 mt-2 text-lg">Amazing! 🏆</p>}
                {reactionTime !== null && reactionTime >= 200 && reactionTime < 300 && (
                  <p className="text-blue-400 mt-2 text-lg">Above Average! 🌟</p>
                )}
                {reactionTime !== null && reactionTime >= 300 && <p className="text-gray-400 mt-2 text-lg">Keep practicing! 💪</p>}
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
