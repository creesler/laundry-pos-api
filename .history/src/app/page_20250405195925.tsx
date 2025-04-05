'use client'

export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-100">
      {/* Right Side Sections */}
      <div className="w-[600px] float-right mr-4 mt-4 flex gap-4">
        {/* Monthly Sales */}
        <div style={{border: '2px solid black'}} className="w-1/2 h-[200px] bg-white">
          Monthly Sales
        </div>

        {/* Inventory */}
        <div style={{border: '2px solid black'}} className="w-1/2 h-[200px] bg-white">
          Inventory
        </div>
      </div>
    </div>
  )
} 