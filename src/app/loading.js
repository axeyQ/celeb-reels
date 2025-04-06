export default function Loading() {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute top-0 left-0 right-0 bottom-0 animate-ping rounded-full bg-white opacity-20"></div>
            <div className="absolute top-2 left-2 right-2 bottom-2 animate-spin rounded-full border-4 border-transparent border-t-white border-b-white"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Loading sports reels</p>
          <div className="mt-4 flex space-x-1">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }