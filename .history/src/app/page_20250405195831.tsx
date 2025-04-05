'use client'

export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-200 p-4">
      {/* Header Section */}
      <div style={{border: '2px solid black'}} className="w-full h-20 bg-white mb-4">
        Header
      </div>

      <div className="flex gap-4 h-[calc(100vh-120px)]">
        {/* Daily Tracker */}
        <div style={{border: '2px solid blue'}} className="w-3/4 bg-white">
          Daily Tracker
        </div>

        {/* Right Side */}
        <div style={{border: '2px solid red'}} className="w-1/4 flex flex-col gap-4">
          {/* Monthly Sales */}
          <div style={{border: '2px solid green'}} className="h-[60%] bg-white">
            Monthly Sales
          </div>

          {/* Inventory */}
          <div style={{border: '2px solid purple'}} className="h-[40%] bg-white">
            Inventory
          </div>
        </div>
      </div>
    </div>
  )
} 