// app/routes/index.tsx
import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { FaHandRock, FaBolt, FaDice } from 'react-icons/fa'
import { Coins, Zap } from 'lucide-react'

export const meta: MetaFunction = () => [{
  title: 'Mini Game Collection',
}]

type GameType = 'online' | 'local'
interface Game {
  slug: string
  gradientFrom: string
  gradientTo: string
  shadowColor: string
  icon: React.ReactNode
  title: string
  description: string
  type: GameType
}

const games: Game[] = [
  {
    slug: 'rock-paper-scissors-lizard-spock',
    gradientFrom: 'indigo-500',
    gradientTo: 'purple-500',
    shadowColor: 'purple-500',
    icon: <FaHandRock size={24} />,
    title: 'Rock Paper Scissors Lizard Spock',
    description:
      "Play the extended version of Rock Paper Scissors featuring Sheldon Cooper's favorite variation!",
    type: 'local',
  },
  {
    slug: 'reaction-test',
    gradientFrom: 'green-500',
    gradientTo: 'emerald-500',
    shadowColor: 'emerald-500',
    icon: <Zap size={24} />,
    title: 'Reaction Test',
    description:
      'Test your reflexes! Click when the color changes and see how fast you can react.',
    type: 'local',
  },
  {
    slug: 'kniffel',
    gradientFrom: 'amber-500',
    gradientTo: 'orange-500',
    shadowColor: 'orange-500',
    icon: <FaDice size={24} />,
    title: 'Kniffel',
    description: 'Play the classic dice game Kniffel!',
    type: 'online',
  },
  {
    slug: 'nim',
    gradientFrom: 'yellow-500',
    gradientTo: 'amber-500',
    shadowColor: 'amber-500',
    icon: <Coins size={24} />,
    title: 'Nim',
    description:
      'A strategic coin removal game - take turns removing coins, but avoid taking the last one!',
    type: 'online',
  },
]

function GameCard({ slug, gradientFrom, gradientTo, shadowColor, icon, title, description, type }: Game) {
  // decide whether this links to /<slug> or /games/<slug>
  const to = type === 'online' ? `/games/${slug}` : `/${slug}`

  return (
    <Link
      to={to}
      className={`
        group relative
        bg-gradient-to-br from-${gradientFrom}/10 to-${gradientTo}/10
        p-6 rounded-xl
        border border-white/10
        hover:border-white/20
        transition-all duration-300
        hover:shadow-xl hover:shadow-${shadowColor}/10
        cursor-pointer
      `}
    >
      <div className={`
        w-10 h-10 rounded-full
        bg-gradient-to-br from-${gradientFrom} to-${gradientTo}
        flex items-center justify-center
        transform transition-all duration-300
        group-hover:scale-110
      `}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold mt-4 mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </Link>
  )
}

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Mini Game Collection
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <GameCard key={g.slug} {...g} />
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-white/5">
          <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-50">
            <h3 className="text-xl font-semibold mb-2">More Games Coming Soon</h3>
            <p className="text-gray-400">Stay tuned for additional mini-games!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
