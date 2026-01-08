'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from '../../../../../utils/axiosInstance'

interface Bid {
  id: string
  sellerName: string
  amount: number
  estimatedTime: string
  message: string
  sellerId: string
}

interface Project {
  id: string
  title: string
  description: string
  budgetMin: number
  budgetMax: number
  deadline: string
  status: string
  deliverableUrl?: string | null
  bids: Bid[]
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    const fetchProjectAndDeliverable = async () => {
      try {
        const projectRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`,
          { withCredentials: true }
        )
        const projectData = projectRes.data.project

        let deliverableUrl: string | null = null
        try {
          const deliverableRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACK_END}/api/deliverable/projects/${id}/deliverables`,
            { withCredentials: true }
          )
          const deliverable = deliverableRes.data.deliverable

          deliverableUrl = deliverable?.fileUrl
            ? `${process.env.NEXT_PUBLIC_BACK_END}${deliverable.fileUrl}`
            : deliverable?.link || null
        } catch (deliverableErr: any) {
          console.warn(
            'No deliverable found:',
            deliverableErr.response?.data?.error || deliverableErr.message
          )
        }

        setProject({
          ...projectData,
          deliverableUrl,
        })
      } catch (err) {
        console.error('Error fetching project or deliverable:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectAndDeliverable()
  }, [id])

  const markAsCompleted = async () => {
    if (!project) return

    setCompleting(true)
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}/status`,
        { status: 'COMPLETED' },
        { withCredentials: true }
      )

      // Update UI immediately
      setProject(prev => (prev ? { ...prev, status: 'COMPLETED' } : prev))
    } catch (err) {
      console.error('Failed to mark as completed:', err)
      alert('Failed to mark as completed')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Project not found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400 p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 text-white">
          <h1 className="text-3xl font-bold mb-4">Project: {project.title}</h1>
          <p className="text-white/70 mb-4">{project.description}</p>
          <p className="text-white/60 mb-2">
            Budget: ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}
          </p>
          <p className="text-white/60 mb-6">
            Deadline: {new Date(project.deadline).toLocaleDateString()}
          </p>

          {project.deliverableUrl ? (
            <div className="bg-white/20 p-6 rounded-xl border border-white/20 mb-6">
              <h2 className="text-xl font-semibold mb-3">Project Deliverable</h2>
              {project.deliverableUrl.endsWith('.pdf') ? (
                <iframe
                  src={project.deliverableUrl}
                  className="w-full h-96 rounded-md border border-white/30"
                />
              ) : (
                <a
                  href={project.deliverableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 underline hover:text-blue-400"
                >
                  View Deliverable
                </a>
              )}
            </div>
          ) : (
            <p className="text-white/70">No deliverable has been uploaded yet.</p>
          )}

          {project.status === 'COMPLETED' ? (
            <div className="inline-block bg-green-500/20 text-green-300 px-4 py-2 rounded-full font-semibold mt-4">
              Completed
            </div>
          ) : (
            <button
              onClick={markAsCompleted}
              disabled={completing}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all mt-4"
            >
              {completing ? 'Completing...' : 'Mark as Completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
