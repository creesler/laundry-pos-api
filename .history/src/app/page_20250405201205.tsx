'use client'

import { useState } from 'react'

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')

  return (
    <div className="min-h-screen bg-[#f9fafb] p-5 font-['Segoe UI']">
      <div className="grid grid-cols-[2fr,1fr] gap-5">
        {/* Header - spans full width */}
        <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xl font-bold">Laundry King</div>
              <div className="text-sm text-gray-500">Laundry Shop POS Daily Entry</div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl text-blue-600">10:35 PM</div>
                <div className="text-sm">
                  Time In: {timeIn}<br/>
                  Time Out: {timeOut}
                </div>
              </div>
              <div className="w-[60px] h-[60px] rounded-full bg-gray-200 overflow-hidden">
                <img src="https://via.placeholder.com/60" alt="User Photo" className="w-full h-full object-cover"/>
              </div>
              <div className="space-y-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
                  Clock In
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
                  Clock Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Tracker */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Daily Tracker</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 text-center">Time</th>
                <th className="border border-gray-200 p-2 text-center">Task</th>
                <th className="border border-gray-200 p-2 text-center">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 p-2 text-center">10:00</td>
                <td className="border border-gray-200 p-2 text-center">Drop Off</td>
                <td className="border border-gray-200 p-2 text-center">3 bags</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-2 text-center">11:00</td>
                <td className="border border-gray-200 p-2 text-center">Soap Refill</td>
                <td className="border border-gray-200 p-2 text-center">Machine #2</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Form + Keypad */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">April 5, 2025</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input type="text" placeholder="Coin" className="p-2 border border-gray-200 rounded-lg"/>
            <input type="text" placeholder="Hopper" className="p-2 border border-gray-200 rounded-lg"/>
            <input type="text" placeholder="Soap" className="p-2 border border-gray-200 rounded-lg"/>
            <input type="text" placeholder="Vending" className="p-2 border border-gray-200 rounded-lg"/>
            <input type="text" placeholder="Drop Off 1" className="p-2 border border-gray-200 rounded-lg"/>
            <input type="text" placeholder="Drop Off 2" className="p-2 border border-gray-200 rounded-lg"/>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9'].map((num) => (
              <button key={num} className="p-5 text-lg font-bold bg-gray-100 rounded-lg hover:bg-gray-200">
                {num}
              </button>
            ))}
            <button className="p-5 text-lg font-bold bg-green-500 text-white rounded-lg hover:bg-green-600">0</button>
            <button className="p-5 text-lg font-bold bg-yellow-400 rounded-lg hover:bg-yellow-500">.</button>
            <button className="p-5 text-lg font-bold bg-red-500 text-white rounded-lg hover:bg-red-600">Del</button>
            <button className="p-5 text-lg font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600">Clr</button>
            <button className="col-span-3 p-5 text-lg font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
          <div className="flex gap-2.5 items-end h-[120px]">
            {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
              <div key={i} className="w-5 bg-blue-600 rounded" style={{height: `${height}px`}}></div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Inventory</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-2">Soap</div>
              <div className="h-5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[70%]"></div>
              </div>
            </div>
            <div>
              <div className="mb-2">Detergent</div>
              <div className="h-5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[50%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 