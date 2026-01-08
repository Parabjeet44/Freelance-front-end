'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-600 via-pink-500 to-red-400 px-4">
      <div className="backdrop-blur-md bg-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 text-center">
        <h1 className="text-9xl font-black text-white/20 absolute -top-10 left-1/2 -translate-x-1/2 select-none">
          404
        </h1>

        <div className="relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="bg-white/20 p-4 rounded-full animate-bounce">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="white" 
                className="w-12 h-12"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow">
            Lost in Space?
          </h2>
          
          <p className="text-white/80 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved to another galaxy.
          </p>

          <Link
            href="/"
            className="block w-full bg-white text-pink-600 font-bold py-3 rounded-xl hover:bg-pink-100 transition-all duration-300 shadow-lg active:scale-95 text-center"
          >
            Return to Safety
          </Link>
        </div>
      </div>
    </div>
  )
}