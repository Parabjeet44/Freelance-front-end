"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "../../../../../utils/axiosInstance";
import Swal from 'sweetalert2';

export default function UploadDeliverablePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Separate file states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // External links
  const [pdfLink, setPdfLink] = useState("");
  const [zipLink, setZipLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_END}/api/project/projects/${projectId}`,
          { withCredentials: true }
        );
        setProject(res.data.project);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'PDF size must be less than 100MB',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      if (file.type !== 'application/pdf') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only PDF files are allowed',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'ZIP size must be less than 100MB',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only ZIP files are allowed',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      setZipFile(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Video size must be less than 100MB',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only video files (MP4, MPEG, MOV, AVI, WEBM) are allowed',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Check if at least one file or link is provided
    if (!pdfFile && !zipFile && !videoFile && !pdfLink && !zipLink && !videoLink) {
      setMessage("Please provide at least one deliverable (file or link).");
      return;
    }

    const formData = new FormData();
    
    // Add files
    if (pdfFile) formData.append("pdf", pdfFile);
    if (zipFile) formData.append("zip", zipFile);
    if (videoFile) formData.append("video", videoFile);
    
    // Add links
    if (pdfLink) formData.append("pdfLink", pdfLink);
    if (zipLink) formData.append("zipLink", zipLink);
    if (videoLink) formData.append("videoLink", videoLink);

    setUploading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/deliverable/projects/${projectId}/deliverables`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.status === 200 || res.status === 201) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Deliverables uploaded successfully',
          confirmButtonColor: '#10b981'
        });
        router.push("/seller/bids");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.error || "Upload failed.";
      setMessage(errorMsg);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: errorMsg,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-500 text-white">
        Loading project...
      </div>
    );
  }

  if (!project || project.status !== "IN_PROGRESS") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-500 text-white">
        Project not found or not in progress.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 p-6 text-white">
      <div className="max-w-4xl mx-auto backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold mb-4">Upload Deliverables</h1>
        <p className="text-white/70 mb-6">
          Project: <strong>{project.title}</strong>
        </p>
        <p className="text-white/60 text-sm mb-8">
          You can upload up to 3 types of files: PDF, ZIP, and Video. Provide at least one.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF Section */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              PDF Document
            </h2>
            
            <div className="mb-4">
              <label className="block text-white mb-2 font-semibold">Upload PDF File</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfChange}
                disabled={uploading}
                className="w-full p-2 bg-white/20 text-white rounded-lg file:bg-white/30 file:text-white file:border-none file:px-4 file:py-2 file:rounded-md file:cursor-pointer hover:file:bg-white/40 transition disabled:opacity-50"
              />
              {pdfFile && (
                <p className="mt-2 text-sm text-green-300">
                  ✓ {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-white/30"></div>
              <span className="text-white/60 text-sm">OR</span>
              <div className="flex-1 border-t border-white/30"></div>
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">PDF External Link</label>
              <input
                type="url"
                placeholder="https://yourpdflink.com"
                value={pdfLink}
                onChange={(e) => setPdfLink(e.target.value)}
                disabled={uploading}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
              />
            </div>
          </div>

          {/* ZIP Section */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ZIP Archive
            </h2>
            
            <div className="mb-4">
              <label className="block text-white mb-2 font-semibold">Upload ZIP File</label>
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleZipChange}
                disabled={uploading}
                className="w-full p-2 bg-white/20 text-white rounded-lg file:bg-white/30 file:text-white file:border-none file:px-4 file:py-2 file:rounded-md file:cursor-pointer hover:file:bg-white/40 transition disabled:opacity-50"
              />
              {zipFile && (
                <p className="mt-2 text-sm text-green-300">
                  ✓ {zipFile.name} ({(zipFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-white/30"></div>
              <span className="text-white/60 text-sm">OR</span>
              <div className="flex-1 border-t border-white/30"></div>
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">ZIP External Link</label>
              <input
                type="url"
                placeholder="https://yourziplink.com"
                value={zipLink}
                onChange={(e) => setZipLink(e.target.value)}
                disabled={uploading}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
              />
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Video Presentation
            </h2>
            
            <div className="mb-4">
              <label className="block text-white mb-2 font-semibold">Upload Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                disabled={uploading}
                className="w-full p-2 bg-white/20 text-white rounded-lg file:bg-white/30 file:text-white file:border-none file:px-4 file:py-2 file:rounded-md file:cursor-pointer hover:file:bg-white/40 transition disabled:opacity-50"
              />
              {videoFile && (
                <p className="mt-2 text-sm text-green-300">
                  ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              <p className="mt-2 text-xs text-white/60">
                Supported: MP4, MPEG, MOV, AVI, WEBM (Max 100MB)
              </p>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-white/30"></div>
              <span className="text-white/60 text-sm">OR</span>
              <div className="flex-1 border-t border-white/30"></div>
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Video External Link</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                disabled={uploading}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
              />
            </div>
          </div>

          {message && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition rounded-lg p-4 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {uploading ? 'Uploading Deliverables...' : 'Submit All Deliverables'}
          </button>
        </form>
      </div>
    </div>
  );
}