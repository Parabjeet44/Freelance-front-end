"use client";

import axios from "../../../../../utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Bid {
  id: string;
  sellerId: string;
  sellerName?: string;
  amount: number;
  estimatedTime: string;
  message: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  sellerId?: number;
}

export default function ProjectBidsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, bidsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_BACK_END}/api/bid/projects/${id}/bids`, { withCredentials: true }),
        ]);
        setProject(projectRes.data.project);
        setBids(bidsRes.data.bids || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleSelectSeller = async (sellerId: string, sellerName: string) => {
    const confirmResult = await Swal.fire({
      title: "Confirm Selection",
      text: `Award this project to ${sellerName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Yes, award project!",
    });

    if (!confirmResult.isConfirmed) return;

    setSelecting(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${id}`,
        { sellerId: parseInt(sellerId) },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setProject(res.data.project);
        await Swal.fire("Success!", "Seller assigned.", "success");
        window.location.reload(); 
      }
    } catch (error: any) {
      Swal.fire("Error", "Failed to select seller.", "error");
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400 flex justify-center items-center text-white font-bold animate-pulse">
        Loading Bids...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400 p-4 md:p-10 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Main Glass Container */}
        <div className="backdrop-blur-xl bg-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 text-white">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Bids for {project?.title}</h1>
              <div className="flex gap-3 items-center">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-tighter">
                  Budget: ${project?.budgetMin} - ${project?.budgetMax}
                </span>
                <span className="bg-indigo-500/40 px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase">
                  Status: {project?.status}
                </span>
              </div>
            </div>
            <button onClick={() => router.back()} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition shadow-lg">
               ← Back
            </button>
          </div>

          {/* Bids List */}
          <div className="space-y-6">
            {bids.map((bid) => {
              const isAwarded = project?.sellerId === parseInt(bid.sellerId);
              
              return (
                <div
                  key={bid.id}
                  className={`relative p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                    isAwarded 
                    ? "bg-white/10 border-green-400/50 shadow-[0_0_30px_-10px_rgba(74,222,128,0.3)]" 
                    : "bg-white/5 border-white/10 hover:bg-white/15"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    
                    {/* Left Side: Seller Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">{bid.sellerName || `Seller #${bid.sellerId}`}</h3>
                        {isAwarded && (
                          <span className="bg-green-500 text-white text-[11px] px-3 py-1 rounded-lg uppercase font-black tracking-widest h-fit inline-flex items-center justify-center">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <p className="text-white/60 uppercase text-[10px] font-bold tracking-widest">
                          Bid Amount: <span className="text-white text-sm font-mono ml-1">${bid.amount / 100}</span>
                        </p>
                        <p className="text-white/60 uppercase text-[10px] font-bold tracking-widest">
                          Delivery: <span className="text-white text-sm ml-1">{bid.estimatedTime} days</span>
                        </p>
                      </div>

                      {/* Message Box */}
                      <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5 inline-block w-full">
                        <p className="text-white/80 italic text-sm leading-relaxed font-medium">
                           "{bid.message}"
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Action Button */}
                    <div className="shrink-0 self-center">
                      {isAwarded ? (
                        <div className="flex items-center gap-2 text-white-900 font-bold bg-white-700 px-5 py-3 rounded-2xl border border-green-400/20  text-sm shadow-inner">
                          Contract Active
                        </div>
                      ) : project?.status === "PENDING" ? (
                        <button
                          onClick={() => handleSelectSeller(bid.sellerId, bid.sellerName || 'Seller')}
                          disabled={selecting}
                          className="bg-white text-purple-700 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-tight hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50"
                        >
                          Award Project
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}