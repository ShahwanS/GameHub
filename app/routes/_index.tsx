// app/routes/index.tsx
import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { FaHandRock, FaBolt, FaDice } from 'react-icons/fa'
import { Coins, Zap, Fish, Sparkles, Users, Monitor, Play, ArrowRight } from 'lucide-react'
import React from 'react'

export const meta: MetaFunction = () => [{
  title: 'GameHub - Mini Game Collection',
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
  players?: string
  difficulty?: string
  category: string
}

const games: Game[] = [
  {
    slug: 'fishing',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-600',
    shadowColor: 'shadow-cyan-500/20',
    icon: <Fish size={28} />,
    title: 'Fishing Game',
    description: 'Ask other players for cards and collect sets in this strategic card game!',
    type: 'online',
    players: '3-6 Players',
    difficulty: 'Medium',
    category: 'Strategy',
  },
  {
    slug: 'kniffel',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    shadowColor: 'shadow-orange-500/20',
    icon: <FaDice size={28} />,
    title: 'Kniffel',
    description: 'Roll dice and score combinations in this classic Yahtzee-style game!',
    type: 'online',
    players: '2-4 Players',
    difficulty: 'Medium',
    category: 'Classic',
  },
  {
    slug: 'nim',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-amber-600',
    shadowColor: 'shadow-amber-500/20',
    icon: <Coins size={28} />,
    title: 'Nim',
    description: 'Take turns removing coins - but don\'t take the last one!',
    type: 'online',
    players: '2 Players',
    difficulty: 'Hard',
    category: 'Strategy',
  },
  {
    slug: 'rock-paper-scissors-lizard-spock',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
    shadowColor: 'shadow-purple-500/20',
    icon: <FaHandRock size={28} />,
    title: 'Rock Paper Scissors Lizard Spock',
    description: "Sheldon Cooper's favorite variation of the classic game!",
    type: 'local',
    players: '2 Players',
    difficulty: 'Easy',
    category: 'Classic',
  },
  {
    slug: 'reaction-test',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
    icon: <Zap size={28} />,
    title: 'Reaction Test',
    description: 'Test your reflexes and see how fast you can react!',
    type: 'local',
    players: '1 Player',
    difficulty: 'Medium',
    category: 'Skill',
  },
]

function GameCard({ slug, gradientFrom, gradientTo, shadowColor, icon, title, description, type, players, difficulty, category }: Game) {
  const to = type === 'online' ? `/games/${slug}` : `/${slug}`

  return (
    <Link to={to} className="group block">
      <div className="relative overflow-hidden rounded-3xl bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-lg`}>
              <div className="text-white">{icon}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-white/10 rounded-full text-white/70">
                {category}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowRight size={12} className="sm:w-4 sm:h-4 text-white/70 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Title and description */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-white/90 transition-colors">
            {title}
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
            {description}
          </p>

          {/* Game info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {type === 'online' ? <Users size={12} className="sm:w-3.5 sm:h-3.5" /> : <Monitor size={12} className="sm:w-3.5 sm:h-3.5" />}
                <span className="text-xs">{players}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-xs">{difficulty}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors">
              <Play size={12} className="sm:w-4 sm:h-4" />
              <span>Play Now</span>
            </div>
          </div>
        </div>

        {/* Hover shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>
    </Link>
  )
}

function CategoryFilter({ activeCategory, onCategoryChange }: { activeCategory: string, onCategoryChange: (category: string) => void }) {
  const categories = ['All', 'Classic', 'Skill', 'Strategy', 'Relaxing']
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
            activeCategory === category
              ? 'bg-white text-black shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default function Index() {
  const [activeCategory, setActiveCategory] = React.useState('All')
  
  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(game => game.category === activeCategory)

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-sm text-gray-300">Welcome to</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  GameHub
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 px-4">
                Dive into a world of engaging mini-games. From quick reflexes to strategic thinking, 
                discover games that challenge and entertain.
              </p>

                             {/* Featured game preview */}
               <div className="max-w-2xl mx-auto px-4">
                 <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 p-6 sm:p-8">
                   <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                       <Fish size={24} className="sm:w-8 sm:h-8 text-white" />
                     </div>
                     <div className="flex-1 text-center sm:text-left">
                       <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Featured: Fishing Game</h3>
                       <p className="text-gray-300 mb-4 text-sm sm:text-base">Ask other players for cards and collect sets in this strategic card game!</p>
                       <Link 
                         to="/games/fishing"
                         className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
                       >
                         <Play size={14} className="sm:w-4 sm:h-4" />
                         Try Now
                       </Link>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Game Collection</h2>
                <p className="text-gray-400 text-sm sm:text-base">Choose your adventure</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-white">{filteredGames.length}</div>
                <div className="text-xs sm:text-sm text-gray-400">Games Available</div>
              </div>
            </div>

            <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

            {/* Staggered grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredGames.map((game, index) => (
                <div 
                  key={game.slug} 
                  className={`transform transition-all duration-700 ${
                    index % 2 === 0 ? 'md:translate-y-0' : 'md:translate-y-8'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <GameCard {...game} />
                </div>
              ))}
            </div>

            {/* Coming Soon Section */}
            {filteredGames.length === games.length && (
              <div className="mt-12 sm:mt-16">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/20 p-6 sm:p-8 lg:p-12 text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
                  <div className="relative space-y-4 sm:space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                      <Sparkles size={24} className="sm:w-8 sm:h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">More Games Coming Soon</h3>
                    <p className="text-gray-300 max-w-md mx-auto text-base sm:text-lg px-4">
                      We're constantly expanding our collection with new and exciting games. 
                      Stay tuned for more adventures!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <span>🎮 New games every month</span>
                      <span className="hidden sm:inline">•</span>
                      <span>🏆 Leaderboards coming soon</span>
                      <span className="hidden sm:inline">•</span>
                      <span>👥 Multiplayer features</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
