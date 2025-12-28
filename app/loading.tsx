import React from 'react'

function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-tr from-purple-600 via-pink-500 to-red-400">
      <div className="w-20 h-20 border-4 border-white/20 border-t-white animate-spin rounded-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 animate-spin rounded-full" />
      </div>
    </div>
  )
}

export default Loading

