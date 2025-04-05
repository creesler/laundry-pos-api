'use client'

export default function Home() {
  return (
    <main className="min-h-screen p-3 border-4 border-black bg-gray-100">
      {/* Header Section */}
      <div className="bg-white mb-3 p-2 h-[80px] border-4 border-blue-500">
        Header Section
      </div>

      <div className="grid grid-cols-12 gap-3 h-[calc(100vh-100px)] border-4 border-red-500">
        {/* Daily Tracker */}
        <div className="col-span-9 bg-white border-4 border-green-500">
          Daily Tracker
        </div>

        {/* Right Side */}
        <div className="col-span-3 space-y-3 border-4 border-purple-500">
          {/* Monthly Sales */}
          <div className="bg-white p-3 h-[200px] border-4 border-yellow-500">
            Monthly Sales
          </div>

          {/* Inventory */}
          <div className="bg-white p-3 h-[100px] border-4 border-orange-500">
            Inventory
          </div>
        </div>
      </div>
    </main>
  )
} 