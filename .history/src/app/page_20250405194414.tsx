'use client'

import { useState } from 'react'

export default function Home() {
  const [timeIn, setTimeIn] = useState<string>('')
  const [timeOut, setTimeOut] = useState<string>('')

  return (
    <main className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-primary">
            <span>🧺</span> Laundry King
          </div>
          <div className="text-gray-500">Laundry Shop POS Daily Entry</div>
        </div>
        
        {/* Time and Clock Controls */}
        <div className="flex items-center gap-4">
          <div className="text-2xl">{new Date().toLocaleTimeString()}</div>
          <div>
            <div>Time In: {timeIn || '--:--'}</div>
            <div>Time Out: {timeOut || '--:--'}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setTimeIn(new Date().toLocaleTimeString())}
            >
              Clock in
            </button>
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => setTimeOut(new Date().toLocaleTimeString())}
            >
              Clock out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Daily Tracker */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Daily Tracker</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Service</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Table rows will be populated dynamically */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-6">
          {/* Date and Entry Fields */}
          <div className="bg-blue-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold mb-4">April 5 2025</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Coin</label>
                <input type="text" className="w-full p-2 rounded text-black" />
              </div>
              <div>
                <label className="block mb-1">Hopper</label>
                <input type="text" className="w-full p-2 rounded text-black" />
              </div>
              <div>
                <label className="block mb-1">Soap</label>
                <input type="text" className="w-full p-2 rounded text-black" />
              </div>
              <div>
                <label className="block mb-1">Vending</label>
                <input type="text" className="w-full p-2 rounded text-black" />
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,'del',4,5,6,'clr',7,8,9,'Save','.','0',','].map((key, i) => (
                <button
                  key={i}
                  className={`p-4 text-lg font-bold rounded
                    ${typeof key === 'number' || key === '.' || key === ',' 
                      ? 'bg-gray-100 hover:bg-gray-200' 
                      : key === 'Save' 
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 