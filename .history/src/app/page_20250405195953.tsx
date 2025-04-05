'use client'

export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      {/* Right Side Panel */}
      <div className="w-[400px] float-right">
        {/* Date and Entry Fields Section */}
        <div style={{border: '2px solid black'}} className="w-full h-[200px] bg-blue-500 mb-4">
          <div className="text-2xl text-white p-4">April 5 2025</div>
        </div>

        {/* Monthly Sales and Inventory in one row */}
        <div className="flex gap-4">
          {/* Monthly Sales */}
          <div style={{border: '2px solid black'}} className="flex-1 h-[120px] bg-blue-100">
            Monthly Sales
          </div>

          {/* Inventory */}
          <div style={{border: '2px solid black'}} className="flex-1 h-[120px] bg-white">
            Inventory
          </div>
        </div>
      </div>
    </div>
  )
} 