'use client'

export default function Home() {
  return (
    <main className="p-4">
      {/* Header Section */}
      <div className="bg-white mb-4 p-4 rounded-lg">
        Header Section
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Daily Tracker */}
        <div className="col-span-8 bg-white rounded-lg p-4">
          Daily Tracker
        </div>

        {/* Right Side */}
        <div className="col-span-4 space-y-4">
          {/* Monthly Sales */}
          <div className="bg-blue-100 rounded-lg p-4">
            Monthly Sales
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg p-4">
            Inventory
          </div>
        </div>
      </div>
    </main>
  )
} 