import React, { useState } from 'react';
import type { FC } from 'react';

interface CreateOrJoinRoomProps {
  onCreate: (name: string) => Promise<void>;
  onJoin: (roomCode: string, name: string) => Promise<void>;
  slug: string;
}

const CreateOrJoinRoom: FC<CreateOrJoinRoomProps> = ({ onCreate, onJoin, slug }) => {
  const [name, setName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [loading, setLoading] = useState<{ create: boolean; join: boolean }>({ create: false, join: false });
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {/* Animated gradient background */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-lg transform rotate-45 flex items-center justify-center">
            <span className="transform -rotate-45 text-3xl">🎲</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-8 mb-8 text-center text-white">
          Welcome to {slug.charAt(0).toUpperCase() + slug.slice(1)}
        </h2>
        
        {error && (
          <div 
            data-testid="error-message" 
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
          >
            {error}
          </div>
        )}
        
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-white placeholder-gray-300 transition-all"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading.create}
            className="group relative w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-300 ease-out group-hover:w-full"></div>
            <span className="relative">
              {loading.create ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create New Room'}
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10 mb-10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">or join existing</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Room Code"
              value={joinRoomCode}
              onChange={e => setJoinRoomCode(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-white placeholder-gray-300 transition-all"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading.join}
            className="group relative w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-rose-600 to-pink-600 transition-all duration-300 ease-out group-hover:w-full"></div>
            <span className="relative">
              {loading.join ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </span>
              ) : 'Join Room'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrJoinRoom;
