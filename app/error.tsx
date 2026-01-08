'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-600 via-pink-500 to-red-400 px-4">
      <div className="backdrop-blur-md bg-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/20 p-4 rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="white" 
              className="w-12 h-12"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow">
          Something went wrong!
        </h2>
        
        <p className="text-white/80 mb-8 leading-relaxed">
          {error.message || "We encountered an unexpected error while processing your request."}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-white text-pink-600 font-bold py-3 rounded-lg hover:bg-pink-100 transition-all duration-300 shadow-lg active:scale-95"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-white/10 text-white font-semibold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition-all duration-300"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}