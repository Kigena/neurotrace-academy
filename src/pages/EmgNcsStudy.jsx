import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function EmgNcsStudy() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-700">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">
              EMG/NCS Study Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            EMG/NCS Clinical Refresher
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Interactive study hub for nerve conduction studies and
            electromyography — electrode placement, normal values, and clinical
            techniques
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              )}
            </svg>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <a
            href="/emg-ncs-study-hub.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open in New Tab
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">160</div>
          <div className="text-xs text-slate-600 font-medium">
            Practice Questions
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">200</div>
          <div className="text-xs text-slate-600 font-medium">Flashcards</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">30</div>
          <div className="text-xs text-slate-600 font-medium">
            Reference Tables
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-indigo-600">29</div>
          <div className="text-xs text-slate-600 font-medium">
            Clinical Images
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        style={{ height: isFullscreen ? "100vh" : "calc(100vh - 260px)" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-600 font-medium">
              Loading EMG/NCS Study Hub...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This may take a moment (loading clinical images)
            </p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/emg-ncs-study-hub.html"
          onLoad={handleIframeLoad}
          title="EMG/NCS Clinical Study Hub"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

export default EmgNcsStudy;
