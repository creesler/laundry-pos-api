'use client'

export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-100">
      {/* Right Side Sections */}
      <div className="absolute right-4 bottom-4 flex gap-4">
        {/* Monthly Sales */}
        <div style={{border: '2px solid black'}} className="w-[300px] h-[150px] bg-white p-4">
          <div className="text-lg mb-2">Monthly Sales</div>
          <div className="h-[100px] flex items-end gap-2">
            {/* Placeholder for bar chart */}
            {Array(11).fill(null).map((_, i) => (
              <div key={i} className="flex-1 bg-blue-200 h-[60%]"></div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div style={{border: '2px solid black'}} className="w-[200px] h-[150px] bg-white p-4">
          <div className="text-lg mb-2">Inventory</div>
          <div className="space-y-4">
            <div>
              <div className="text-sm mb-1">Soap</div>
              <div className="w-full h-4 bg-blue-100">
                <div className="w-3/4 h-full bg-blue-500"></div>
              </div>
            </div>
            <div>
              <div className="text-sm mb-1">Detergent</div>
              <div className="w-full h-4 bg-blue-100">
                <div className="w-1/2 h-full bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 