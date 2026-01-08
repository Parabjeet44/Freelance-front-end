'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from '../../../utils/axiosInstance';

interface Project {
  id: number
  title: string
  description: string
  budgetMin: number
  budgetMax: number
  deadline: string
}

export default function BuyerDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects`, { withCredentials: true })
        setProjects(res.data.project)
      } catch (err) {
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleLogout = () => {
    router.push('/logout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading projects...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400 p-10 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Buyer Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full hover:bg-white/30 transition text-white font-semibold shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        </div>

        {/* Create Project Button */}
        <div className="mb-8">
          <Link
            href="/buyer/projects/new"
            className="inline-block bg-white text-purple-600 px-6 py-3 rounded-full hover:bg-white/90 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            + Create New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm p-12 rounded-2xl border border-white/20 text-center">
            <p className="text-white/70 text-lg">You haven't created any projects yet.</p>
            <p className="text-white/50 mt-2">Click "Create New Project" to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:bg-white/15"
              >
                <h2 className="text-2xl font-bold mb-3">{project.title}</h2>
                <p className="text-white/80 mb-4 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60"></span>
                    <p className="text-white/90 font-medium">
                      ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60"></span>
                    <p className="text-white/90 font-medium">
                      {new Date(project.deadline).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/20">
                  <Link
                    href={`/buyer/projects/${project.id}`}
                    className="flex-1 min-w-fit bg-blue-500/80 hover:bg-blue-500 px-4 py-2 rounded-lg text-center text-white font-semibold transition shadow-md hover:shadow-lg"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/buyer/projects/${project.id}/bids`}
                    className="flex-1 min-w-fit bg-purple-500/80 hover:bg-purple-500 px-4 py-2 rounded-lg text-center text-white font-semibold transition shadow-md hover:shadow-lg"
                  >
                    Bids
                  </Link>
                  <Link
                    href={`/buyer/projects/${project.id}/deliverable`}
                    className="flex-1 min-w-fit bg-green-500/80 hover:bg-green-500 px-4 py-2 rounded-lg text-center text-white font-semibold transition shadow-md hover:shadow-lg"
                  >
                    Deliverables
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
