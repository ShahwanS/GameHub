import React, { useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowRight, Sparkles, Fish, Coins, Zap, Hand } from 'lucide-react';

interface CreateOrJoinRoomProps {
  onCreate: (name: string) => Promise<void>;
  onJoin: (roomCode: string, name: string) => Promise<void>;
  slug: string;
}

// Game-specific configurations
const gameConfigs = {
  'kniffel': {
    icon: <Sparkles size={32} />,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-900/20 via-orange-900/20 to-yellow-900/20',
    title: 'Kniffel',
    subtitle: 'Roll the dice and score combinations!',
    description: 'Create or join a room to play the classic Yahtzee-style dice game with friends.',
    features: ['2-4 Players', 'Strategic Scoring', 'Real-time Multiplayer']
  },
  'fishing': {
    icon: <Fish size={32} />,
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-900/20 via-cyan-900/20 to-teal-900/20',
    title: 'Fishing Game',
    subtitle: 'Ask for cards and collect sets!',
    description: 'Create or join a room to play this strategic card collection game.',
    features: ['3-6 Players', 'Card Strategy', 'Set Collection']
  },
  'nim': {
    icon: <Coins size={32} />,
    gradient: 'from-yellow-500 to-amber-600',
    bgGradient: 'from-yellow-900/20 via-amber-900/20 to-orange-900/20',
    title: 'Nim',
    subtitle: 'Strategic coin removal game!',
    description: 'Create or join a room to play this mathematical strategy game.',
    features: ['2 Players', 'Mathematical Strategy', 'Perfect Information']
  }
};

const CreateOrJoinRoom: FC<CreateOrJoinRoomProps> = ({ onCreate, onJoin, slug }) => {
  const [name, setName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [loading, setLoading] = useState<{ create: boolean; join: boolean }>({ create: false, join: false });
  const [error, setError] = useState<string | null>(null);

  const gameConfig = gameConfigs[slug as keyof typeof gameConfigs] || {
    icon: <Sparkles size={32} />,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-900/20 via-pink-900/20 to-violet-900/20',
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    subtitle: 'Join the adventure!',
    description: 'Create or join a room to play with friends.',
    features: ['Multiplayer', 'Real-time', 'Fun']
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter your name to create a room.');
      return;
    }
    setError(null);
    setLoading(prev => ({ ...prev, create: true }));
    try {
      await onCreate(name.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleJoin = async () => {
    if (!joinRoomCode.trim() || !name.trim()) {
      setError('Please enter both room code and your name to join.');
      return;
    }
    setError(null);
    setLoading(prev => ({ ...prev, join: true }));
    try {
      await onJoin(joinRoomCode.trim(), name.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(prev => ({ ...prev, join: false }));
    }
  };

  return (
    <div className="min-h-screen bg-black ">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gameConfig.bgGradient}`} />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 sm:mb-6">
              <Sparkles size={14} className="sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-gray-300">Game Room</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center shadow-lg`}>
                <div className="text-white">{gameConfig.icon}</div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
                  {gameConfig.title}
                </h1>
                <p className="text-lg sm:text-xl text-gray-300">{gameConfig.subtitle}</p>
              </div>
            </div>
            
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              {gameConfig.description}
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Create Room */}
            <motion.div 
              className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gameConfig.gradient} opacity-0 hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center`}>
                    <Plus size={20} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Create Room</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Start a new game session</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-gray-400 transition-all text-sm sm:text-base"
                    />
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={loading.create}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading.create ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="sm:w-5 sm:h-5" />
                        Create New Room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Join Room */}
            <motion.div 
              className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gameConfig.gradient} opacity-0 hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center`}>
                    <Users size={20} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Join Room</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Enter an existing game</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-gray-400 transition-all text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Room Code</label>
                    <input
                      type="text"
                      placeholder="Enter room code"
                      value={joinRoomCode}
                      onChange={e => setJoinRoomCode(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-gray-400 transition-all text-sm sm:text-base"
                    />
                  </div>

                  <button
                    onClick={handleJoin}
                    disabled={loading.join}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading.join ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                        Join Room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Game Features */}
          <motion.div 
            className="mt-8 sm:mt-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center">Game Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {gameConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 text-gray-300">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full" />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrJoinRoom;
