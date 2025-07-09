// app/routes/rock-paper-scissors-lizard-spock.tsx
import { useState } from 'react'
import { BrickWall, Scissors, Scroll } from 'lucide-react'
import { FaRegHandLizard, FaRegHandSpock } from 'react-icons/fa'

export default function RPSLSPage() {
  const options = [
    { name: 'Rock',      color: 'from-zinc-700 to-zinc-800', icon: <BrickWall /> },
    { name: 'Paper',     color: 'from-sky-200 to-sky-300',   icon: <Scroll /> },
    { name: 'Scissors',  color: 'from-sky-300 to-sky-400',   icon: <Scissors /> },
    { name: 'Lizard',    color: 'from-emerald-300 to-emerald-400', icon: <FaRegHandLizard /> },
    { name: 'Spock',     color: 'from-indigo-300 to-indigo-400',  icon: <FaRegHandSpock /> },
  ] as const
  type Weapon = typeof options[number]['name']

  const [userChoice, setUserChoice] = useState<Weapon | null>(null)
  const [computerChoice, setComputerChoice] = useState<Weapon | null>(null)
  const [gameState, setGameState] = useState<'playing' | 'done'>('playing')

  function handleUserChoice(weapon: Weapon) {
    setUserChoice(weapon)
    const random = options[Math.floor(Math.random() * options.length)].name
    setComputerChoice(random)
    setGameState('done')
  }
  function restartGame() {
    setUserChoice(null)
    setComputerChoice(null)
    setGameState('playing')
  }
  function getResult() {
    if (userChoice === computerChoice) return 'Draw 🤝'
    switch (userChoice) {
      case 'Rock':
        return (computerChoice === 'Scissors' || computerChoice === 'Lizard')
          ? `Rock crushes ${computerChoice} 💪`
          : 'You Lose 😢'
      case 'Paper':
        return computerChoice === 'Rock'
          ? `Paper covers ${computerChoice} 📄`
          : (computerChoice === 'Spock')
            ? `Paper disproves ${computerChoice} 📝`
            : 'You Lose 😢'
      case 'Scissors':
        return (computerChoice === 'Paper')
          ? `Scissors cuts ${computerChoice} ✂️`
          : (computerChoice === 'Lizard')
            ? `Scissors decapitates ${computerChoice} 🗡️`
            : 'You Lose 😢'
      case 'Lizard':
        return (computerChoice === 'Paper')
          ? `Lizard eats ${computerChoice} 🦎`
          : (computerChoice === 'Spock')
            ? `Lizard poisons ${computerChoice} 🤢`
            : 'You Lose 😢'
      case 'Spock':
        return (computerChoice === 'Scissors')
          ? `Spock smashes ${computerChoice} 🖖`
          : (computerChoice === 'Rock')
            ? `Spock vaporizes ${computerChoice} ⚡`
            : 'You Lose 😢'
      default:
        return 'Draw 🤝'
    }
  }

  return (
    <div className="min-h-screen pt-24 text-white flex flex-col justify-center items-center p-4 sm:p-8 gap-5 relative bg-black">
      {/* Background image: place 984314.jpg into your Remix /public folder */}
      <div className="absolute inset-0 flex justify-center items-center opacity-30 pointer-events-none">
        <img
          src="/984314.jpg"
          alt="Atoms background"
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white relative text-center">
        Rock Paper Scissors Lizard Spock
      </h1>
      <blockquote className="text-center text-indigo-200 italic text-sm sm:text-lg max-w-2xl border-l-4 border-indigo-400 pl-4">
        "Scissors cuts paper, paper covers rock, rock crushes lizard, lizard poisons
        Spock, Spock smashes scissors, scissors decapitates lizard, lizard eats paper,
        paper disproves Spock, Spock vaporizes rock, and as it always has, rock crushes
        scissors" – Sheldon Cooper
      </blockquote>

      {gameState === 'playing' ? (
        <>
          <h2 className="text-xl sm:text-2xl font-medium text-sky-300 animate-pulse">
            Choose your weapon
          </h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            {options.map((opt) => (
              <button
                key={opt.name}
                onClick={() => handleUserChoice(opt.name)}
                className={`
                  w-28 h-28 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br ${opt.color}/70 
                  transform transition duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20
                  backdrop-blur-sm cursor-pointer active:scale-95 flex flex-col justify-center items-center
                  border border-white/10
                `}
              >
                <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex justify-center items-center">
                  {opt.icon}
                </div>
                <span className="text-xl sm:text-3xl font-bold text-white mt-2 sm:mt-4">
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center space-y-4 sm:space-y-6 backdrop-blur-sm bg-white/5 p-4 sm:p-8 rounded-2xl border border-white/10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Game Over!</h2>
          <div className="space-y-2 sm:space-y-3">
            <p className="text-lg sm:text-xl text-indigo-200">
              You chose <span className="font-bold text-sky-300">{userChoice}</span>
            </p>
            <p className="text-lg sm:text-xl text-indigo-200">
              AI chose <span className="font-bold text-indigo-400">{computerChoice}</span>
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{getResult()}</p>
          </div>
          <button
            onClick={restartGame}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-indigo-500 rounded-full font-bold
                       hover:opacity-90 transition duration-300 hover:shadow-lg hover:shadow-indigo-500/20
                       active:scale-95 z-10"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
