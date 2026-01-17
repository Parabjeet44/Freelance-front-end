'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import Swal from 'sweetalert2'

interface Deliverable {
  id: string
  pdfUrl?: string
  pdfLink?: string
  zipUrl?: string
  zipLink?: string
  videoUrl?: string
  videoLink?: string
  seller: {
    id: string
    name: string
    email: string
  }
}

interface Project {
  id: string
  title: string
  description: string
  budgetMin: number
  budgetMax: number
  deadline: string
  status: string
  deliverable?: Deliverable
}

export default function DeliverablePage() {
  const router = useRouter()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  // Render all three deliverables
  const renderDeliverables = (deliverable: Deliverable | undefined) => {
    if (!deliverable) {
      return <p className="text-white/70">No deliverables uploaded yet.</p>
    }

    const hasPdf = deliverable.pdfUrl || deliverable.pdfLink
    const hasZip = deliverable.zipUrl || deliverable.zipLink
    const hasVideo = deliverable.videoUrl || deliverable.videoLink

    if (!hasPdf && !hasZip && !hasVideo) {
      return <p className="text-white/70">No deliverables uploaded yet.</p>
    }

    return (
      <div className="space-y-6">
        {/* PDF Deliverable */}
        {hasPdf && (
          <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              PDF Document
            </h3>
            
            {deliverable.pdfLink ? (
              <a
                href={deliverable.pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-400 font-semibold"
              >
                Open PDF Link →
              </a>
            ) : deliverable.pdfUrl ? (
              <div className="space-y-3">
                <iframe
                  src={`${process.env.NEXT_PUBLIC_BACK_END}${deliverable.pdfUrl}`}
                  className="w-full h-96 rounded-md border border-white/30"
                  title="PDF Deliverable"
                />
                <a
                  href={`${process.env.NEXT_PUBLIC_BACK_END}${deliverable.pdfUrl}`}
                  download
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition"
                >
                  Download PDF
                </a>
              </div>
            ) : null}
          </div>
        )}

        {/* ZIP Deliverable */}
        {hasZip && (
          <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              ZIP Archive
            </h3>
            
            {deliverable.zipLink ? (
              <a
                href={deliverable.zipLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-400 font-semibold"
              >
                Open ZIP Link →
              </a>
            ) : deliverable.zipUrl ? (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-white/70 mb-3">Compressed file ready for download</p>
                <a
                  href={`${process.env.NEXT_PUBLIC_BACK_END}${deliverable.zipUrl}`}
                  download
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
                >
                  Download ZIP File
                </a>
              </div>
            ) : null}
          </div>
        )}

        {/* Video Deliverable */}
        {hasVideo && (
          <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Video Presentation
            </h3>
            
            {deliverable.videoLink ? (
              <a
                href={deliverable.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-400 font-semibold"
              >
                Watch Video →
              </a>
            ) : deliverable.videoUrl ? (
              <video
                controls
                className="w-full rounded-md border border-white/30 bg-black"
                src={`${process.env.NEXT_PUBLIC_BACK_END}${deliverable.videoUrl}`}
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`,
          { withCredentials: true }
        )
        setProject(res.data.project)
      } catch (err) {
        console.error('Error fetching project:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load project details',
          confirmButtonColor: '#ef4444'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
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
      setProject(prev => (prev ? { ...prev, status: 'COMPLETED' } : prev))
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Project marked as completed',
        confirmButtonColor: '#10b981'
      })
    } catch (err) {
      console.error('Failed to mark as completed:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to mark as completed',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400">
        <div className="text-white text-xl">Loading deliverables...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400">
        <div className="text-white text-xl">Project not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400 p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 text-white">
          {/* Project Info Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-white/70 mb-4">{project.description}</p>
            <div className="flex gap-6 text-sm text-white/60">
              <span>Budget: ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}</span>
              <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              <span className="capitalize">Status: {project.status.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Project Deliverables</h2>
            {project.deliverable?.seller && (
              <p className="text-white/70 mb-6">
                Submitted by: <strong>{project.deliverable.seller.name}</strong> ({project.deliverable.seller.email})
              </p>
            )}
            {renderDeliverables(project.deliverable)}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/buyer/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
            
            {project.status !== 'COMPLETED' && (
              <button
                onClick={markAsCompleted}
                disabled={completing}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all"
              >
                {completing ? 'Completing...' : 'Mark as Completed'}
              </button>
            )}

            {project.status === 'COMPLETED' && (
              <div className="inline-flex items-center bg-green-500/20 text-green-300 px-4 py-2 rounded-full font-semibold">
                ✓ Completed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}