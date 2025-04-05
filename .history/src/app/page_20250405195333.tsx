'use client'

import { useState } from 'react'

export default function Home() {
  const [timeIn, setTimeIn] = useState<string>('')
  const [timeOut, setTimeOut] = useState<string>('')

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">🧺</span>
          <div>
            <div className="text-xl font-bold text-primary">Laundry King</div>
            <div className="text-sm text-gray-500">Laundry Shop POS Daily Entry</div>
          </div>
        </div>
        
        {/* Time and Clock Controls */}
        <div className="flex items-center space-x-6">
          <div className="text-4xl font-semibold">10:35 PM</div>
          <div className="text-gray-600">
            <div>Time In: {timeIn || '10:00 PM'}</div>
            <div>Time Out: {timeOut || '--:--'}</div>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            {/* Profile picture placeholder */}
          </div>
          <div className="flex flex-col gap-2">
            <button className="px-6 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 font-medium">
              Clock in
            </button>
            <button className="px-6 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 font-medium">
              Clock out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-4 gap-6">
        {/* Daily Tracker */}
        <div className="col-span-3">
          <div className="bg-[#1e3a4f] text-white p-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Daily Tracker</h2>
          </div>
          <div className="bg-white rounded-b-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left bg-gray-50">Time</th>
                    <th className="p-3 text-left bg-gray-50">Customer</th>
                    <th className="p-3 text-left bg-gray-50">Service</th>
                    <th className="p-3 text-left bg-gray-50">Amount</th>
                    <th className="p-3 text-left bg-gray-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(8).fill(null).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="p-3"></td>
                      <td className="p-3"></td>
                      <td className="p-3"></td>
                      <td className="p-3"></td>
                      <td className="p-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-4">
          {/* Date and Entry Fields */}
          <div className="bg-blue-500 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold mb-6">April 5 2025</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Coin</label>
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Hopper</label>
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Soap</label>
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Vending</label>
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">Drop Off</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                  <input type="text" className="w-full p-2 rounded text-black text-right" readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                '1', '2', '3', 'del',
                '4', '5', '6', 'clr',
                '7', '8', '9', 'Save',
                '.', '0', ','
              ].map((key, i) => (
                <button
                  key={i}
                  className={`
                    p-4 text-lg font-semibold rounded-lg
                    ${key === 'del' ? 'bg-red-100 text-red-600' :
                      key === 'clr' ? 'bg-gray-200 text-gray-700' :
                      key === 'Save' ? 'bg-green-500 text-white' :
                      'bg-gray-100 text-gray-800'}
                    ${key === 'Save' ? 'hover:bg-green-600' : 'hover:bg-opacity-80'}
                    ${i === 14 ? 'col-span-2' : ''}
                  `}
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