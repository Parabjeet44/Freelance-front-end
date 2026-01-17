'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from '../../../../utils/axiosInstance'
import Swal from 'sweetalert2'

interface Deliverable {
  id: string
  fileUrl?: string
  link?: string
  fileType?: string
  seller: {
    id: string
    name: string
    email: string
  }
}

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
  deliverable?: Deliverable
  bids: Bid[]
}

export default function ProjectDetailsPage() {
  const router = useRouter()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    budgetMin: 0,
    budgetMax: 0,
    deadline: ''
  })

  // Render deliverable based on file type
  const renderDeliverable = (deliverable: Deliverable | undefined) => {
    if (!deliverable) return null

    // If external link provided
    if (deliverable.link) {
      return (
        <a
          href={deliverable.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-200 underline hover:text-blue-400 font-semibold"
        >
          🔗 Open External Link
        </a>
      )
    }

    // If file uploaded
    if (deliverable.fileUrl) {
      const fileType = deliverable.fileType || 'other'
      const fileUrl = `${process.env.NEXT_PUBLIC_BACK_END}${deliverable.fileUrl}`

      switch (fileType) {
        case 'pdf':
          return (
            <div className="space-y-3">
              <p className="text-white/80 font-semibold">📄 PDF Document</p>
              <iframe
                src={fileUrl}
                className="w-full h-96 rounded-md border border-white/30"
                title="PDF Deliverable"
              />
              <a
                href={fileUrl}
                download
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all"
              >
                Download PDF
              </a>
            </div>
          )

        case 'video':
          return (
            <div className="space-y-3">
              <p className="text-white/80 font-semibold">🎥 Video Deliverable</p>
              <video
                controls
                className="w-full rounded-md border border-white/30 bg-black"
                src={fileUrl}
              >
                Your browser does not support the video tag.
              </video>
              <a
                href={fileUrl}
                download
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all"
              >
                Download Video
              </a>
            </div>
          )

        case 'zip':
          return (
            <div className="space-y-3">
              <p className="text-white/80 font-semibold">📦 ZIP Archive</p>
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <p className="text-white/70 mb-3">Compressed file ready for download</p>
                <a
                  href={fileUrl}
                  download
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                >
                  📥 Download ZIP File
                </a>
              </div>
            </div>
          )

        default:
          return (
            <div className="space-y-3">
              <p className="text-white/80 font-semibold">📎 File Deliverable</p>
              <a
                href={fileUrl}
                download
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                Download File
              </a>
            </div>
          )
      }
    }

    return <p className="text-white/60">No deliverable available</p>
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`,
          { withCredentials: true }
        )
        setProject(res.data.project)
        
        // Initialize edit form with current project data
        setEditForm({
          title: res.data.project.title,
          description: res.data.project.description,
          budgetMin: res.data.project.budgetMin,
          budgetMax: res.data.project.budgetMax,
          deadline: new Date(res.data.project.deadline).toISOString().split('T')[0]
        })
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

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to current project data
    if (project) {
      setEditForm({
        title: project.title,
        description: project.description,
        budgetMin: project.budgetMin,
        budgetMax: project.budgetMax,
        deadline: new Date(project.deadline).toISOString().split('T')[0]
      })
    }
  }

  const handleSaveEdit = async () => {
    if (!project) return

    // Validation
    if (!editForm.title || !editForm.description || !editForm.budgetMin || !editForm.budgetMax || !editForm.deadline) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all fields',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    if (editForm.budgetMin > editForm.budgetMax) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Minimum budget cannot exceed maximum budget',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`,
        editForm,
        { withCredentials: true }
      )

      setProject(prev => prev ? {
        ...prev,
        title: editForm.title,
        description: editForm.description,
        budgetMin: editForm.budgetMin,
        budgetMax: editForm.budgetMax,
        deadline: editForm.deadline
      } : prev)

      setIsEditing(false)

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Project details updated successfully',
        confirmButtonColor: '#10b981'
      })
    } catch (err) {
      console.error('Failed to update project:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update project details',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`,
          { withCredentials: true }
        )

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your project has been deleted.',
          confirmButtonColor: '#10b981'
        })

        // Redirect to projects list
        router.push('/buyer/dashboard')
      } catch (err) {
        console.error('Failed to delete project:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete project',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400">
        <div className="text-white text-xl">Loading project...</div>
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
      <div className="w-full max-w-3xl">
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 text-white">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">Project: {project.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-white/70 mb-4">{project.description}</p>
              <p className="text-white/60 mb-2">
                Budget: ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}
              </p>
              <p className="text-white/60 mb-2">
                Deadline: {new Date(project.deadline).toLocaleDateString()}
              </p>
              <p className="text-white/60 mb-6">
                Status: <span className="font-semibold capitalize">{project.status.replace('_', ' ')}</span>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Min Budget ($)</label>
                    <input
                      type="number"
                      value={editForm.budgetMin}
                      onChange={(e) => setEditForm({ ...editForm, budgetMin: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Budget ($)</label>
                    <input
                      type="number"
                      value={editForm.budgetMax}
                      onChange={(e) => setEditForm({ ...editForm, budgetMax: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deadline</label>
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

         

          {/* Status and Complete Button */}
          {!isEditing && (
            <div className="mt-6">
              {project.status === 'COMPLETED' ? (
                <div className="inline-block bg-green-500/20 text-green-300 px-4 py-2 rounded-full font-semibold">
                  ✓ Completed
                </div>
              ) : (
                <button
                  onClick={markAsCompleted}
                  disabled={completing}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all"
                >
                  {completing ? 'Completing...' : 'Mark as Completed'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}