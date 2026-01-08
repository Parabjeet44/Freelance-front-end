'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from '../../../../utils/axiosInstance'
import Swal from 'sweetalert2'

interface Project {
  id: string
  title: string
  description: string
  budget: string
  deadline: string
  status: string
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }

  const [project, setProject] = useState<Project | null>(null)
  const [hasBid, setHasBid] = useState(false)
  const [loading, setLoading] = useState(true)

  const [amount, setAmount] = useState('')
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const projectRes = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END}/api/bid/projects/${id}/details`, {
          withCredentials: true
        })
        setProject(projectRes.data)

        const bidStatusRes = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END}/api/bid/projects/${id}/hasBid`, {
          withCredentials: true
        })
        setHasBid(bidStatusRes.data.hasBid)
      } catch (err) {
        console.error('Error fetching project details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDetails()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Confirmation Dialog
    const result = await Swal.fire({
      title: 'Submit your bid?',
      text: `You are bidding $${amount} to be completed in ${time} days.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#a855f7', // purple-500
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, submit it!'
    })

    if (!result.isConfirmed) return

    setSubmitting(true)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACK_END}/api/bid/bids`, {
        projectId: id,
        amount: parseFloat(amount),
        estimatedTime: time,
        message,
      }, {
        withCredentials: true
      })

      if (res.status === 200 || res.status === 201) {
        // 2. Success Message
        await Swal.fire({
          icon: 'success',
          title: 'Bid Placed!',
          text: 'Your bid has been submitted successfully.',
          confirmButtonColor: '#10b981'
        })
        
        setHasBid(true)
        setAmount('')
        setTime('')
        setMessage('')
      }
    } catch (err: any) {
      console.error('Error submitting bid:', err)
      const errorMessage = err.response?.data?.message || 'Something went wrong.'
      
      // 3. Error Message
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const goToMyBids = () => router.push('/seller/bids')
  const goToDashboard = () => router.push(`/seller/dashboard`)

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500">
        <div className="text-white text-xl animate-pulse">Loading project details...</div>
    </div>
  )

  if (!project) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500">
        <div className="text-white text-center">
            <h1 className="text-2xl font-bold">Project not found.</h1>
            <button onClick={goToDashboard} className="mt-4 underline text-white/70">Back to Dashboard</button>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 p-6 text-white">
      <div className="flex justify-between items-center max-w-3xl mx-auto mb-6">
        <button
          onClick={goToMyBids}
          className="bg-yellow-400 text-black font-bold px-5 py-2 rounded-xl hover:bg-yellow-500 transition shadow-lg"
        >
          My Bids
        </button>

        <button
          onClick={goToDashboard}
          className="bg-white/20 text-white font-bold px-5 py-2 rounded-xl hover:bg-white/30 transition border border-white/30"
        >
          Dashboard
        </button>
      </div>

      <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="mb-6">
            <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-400/30">
                {project.status}
            </span>
            <h1 className="text-4xl font-black mt-3 mb-2">{project.title}</h1>
            <p className="text-white/80 leading-relaxed">{project.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 bg-black/10 p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-white/50 text-sm uppercase font-bold">Budget</p>
            <p className="text-xl font-semibold text-green-300">{project.budget}</p>
          </div>
          <div>
            <p className="text-white/50 text-sm uppercase font-bold">Deadline</p>
            <p className="text-xl font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
          </div>
        </div>

        {hasBid ? (
          <div className="p-6 bg-green-500/20 border border-green-300/30 rounded-2xl flex items-center gap-4">
            <div>
                <p className="text-green-100 text-lg font-bold">Bid Active</p>
                <p className="text-green-200/70 text-sm">You have already placed a bid on this project. You can view its status in 'My Bids'.</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-2">Place Your Bid</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block mb-2 text-sm font-bold text-white/60 uppercase">Bid Amount ($)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    placeholder="e.g. 500"
                />
                </div>

                <div>
                <label className="block mb-2 text-sm font-bold text-white/60 uppercase">Days to complete</label>
                <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    placeholder="e.g. 7"
                />
                </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-white/60 uppercase">Your Proposal</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="Explain why you're the best fit..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95"
            >
              {submitting ? 'SENDING BID...' : 'SUBMIT PROPOSAL'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}