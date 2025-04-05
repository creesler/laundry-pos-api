'use client'

export default function Home() {
  return (
    <main className="min-h-screen p-3">
      {/* Header Section */}
      <div className="bg-white mb-3 p-2 rounded-lg shadow-sm h-[80px]">
        Header Section
      </div>

      <div className="grid grid-cols-12 gap-3 h-[calc(100vh-100px)]">
        {/* Daily Tracker */}
        <div className="col-span-9 bg-white rounded-lg shadow-sm">
          Daily Tracker
        </div>

        {/* Right Side */}
        <div className="col-span-3 space-y-3">
          {/* Monthly Sales */}
          <div className="bg-blue-100 rounded-lg p-3 h-[200px]">
            Monthly Sales
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg p-3 h-[100px]">
            Inventory
          </div>
        </div>
      </div>
    </main>
  )
} 