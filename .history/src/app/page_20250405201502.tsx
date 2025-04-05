'use client'

import { useState } from 'react'

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')

  return (
    <div className="m-0 font-['Segoe UI'] bg-[#f9fafb] text-[#1f2937] p-5">
      <div className="main-grid grid gap-5" 
        style={{
          gridTemplateAreas: '"header header" "tracker form" "sales inventory"',
          gridTemplateColumns: '2fr 1fr'
        }}>
        {/* Header */}
        <div className="[grid-area:header] flex justify-between items-center bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="left">
            <div className="text-[20px] font-bold">Laundry King</div>
            <small>Laundry Shop POS Daily Entry</small>
          </div>
          <div className="right flex items-center gap-[15px]">
            <div>
              <div className="clock-time text-[28px] text-[#2563eb]">10:35 PM</div>
              <div>
                Time In: {timeIn}<br/>
                Time Out: {timeOut}
              </div>
            </div>
            <img src="https://via.placeholder.com/60" className="profile w-[60px] h-[60px] rounded-full object-cover" alt="User Photo"/>
            <div className="flex flex-col gap-2">
              <button className="btn py-2 px-[14px] rounded-[20px] border-none bg-[#2563eb] text-white font-bold cursor-pointer hover:bg-[#1e40af] transition-[background_0.2s]">
                Clock In
              </button>
              <button className="btn py-2 px-[14px] rounded-[20px] border-none bg-[#2563eb] text-white font-bold cursor-pointer hover:bg-[#1e40af] transition-[background_0.2s]">
                Clock Out
              </button>
            </div>
          </div>
        </div>

        {/* Daily Tracker */}
        <div className="[grid-area:tracker] section bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3>Daily Tracker</h3>
          <table className="tracker-table w-full border-collapse mt-[10px]">
            <thead>
              <tr>
                <th className="border border-[#e5e7eb] p-[6px] text-center">Time</th>
                <th className="border border-[#e5e7eb] p-[6px] text-center">Task</th>
                <th className="border border-[#e5e7eb] p-[6px] text-center">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#e5e7eb] p-[6px] text-center">10:00</td>
                <td className="border border-[#e5e7eb] p-[6px] text-center">Drop Off</td>
                <td className="border border-[#e5e7eb] p-[6px] text-center">3 bags</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Form + Keypad */}
        <div className="[grid-area:form] section bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3 className="mt-0">April 5, 2025</h3>
          <div className="form-inputs grid grid-cols-2 gap-2 mb-3">
            <input type="text" placeholder="Coin" className="p-2 rounded-md border border-[#e5e7eb]"/>
            <input type="text" placeholder="Hopper" className="p-2 rounded-md border border-[#e5e7eb]"/>
            <input type="text" placeholder="Soap" className="p-2 rounded-md border border-[#e5e7eb]"/>
            <input type="text" placeholder="Vending" className="p-2 rounded-md border border-[#e5e7eb]"/>
            <input type="text" placeholder="Drop Off 1" className="p-2 rounded-md border border-[#e5e7eb]"/>
            <input type="text" placeholder="Drop Off 2" className="p-2 rounded-md border border-[#e5e7eb]"/>
          </div>
          <div className="keypad grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9'].map((num) => (
              <button key={num} className="p-5 text-base font-bold rounded-[10px] border-none cursor-pointer bg-[#e5e7eb] text-[#1f2937] hover:bg-[#d1d5db] transition-all">
                {num}
              </button>
            ))}
            <button className="zero p-5 text-base font-bold rounded-[10px] border-none cursor-pointer bg-[#22c55e] text-white hover:bg-opacity-90 transition-all">0</button>
            <button className="dot p-5 text-base font-bold rounded-[10px] border-none cursor-pointer bg-[#facc15] hover:bg-opacity-90 transition-all">.</button>
            <button className="del p-5 text-base font-bold rounded-[10px] border-none cursor-pointer bg-[#ef4444] text-white hover:bg-opacity-90 transition-all">Del</button>
            <button className="clr p-5 text-base font-bold rounded-[10px] border-none cursor-pointer bg-[#3b82f6] text-white hover:bg-opacity-90 transition-all">Clr</button>
            <button className="save col-span-3 p-5 text-base font-bold rounded-[10px] border-none cursor-pointer bg-[#2563eb] text-white hover:bg-opacity-90 transition-all">Save</button>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="[grid-area:sales] section bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3>Monthly Sales</h3>
          <div className="bar-chart flex gap-[10px] items-end h-[120px]">
            {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
              <div key={i} className="bg-[#2563eb] w-5 rounded" style={{height: `${height}px`}}></div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="[grid-area:inventory] section bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3>Inventory</h3>
          <div>Soap</div>
          <div className="progress bg-[#e5e7eb] h-5 rounded-[10px] overflow-hidden mb-[10px]">
            <div className="progress-bar bg-[#2563eb] h-full" style={{width: '70%'}}></div>
          </div>
          <div>Detergent</div>
          <div className="progress bg-[#e5e7eb] h-5 rounded-[10px] overflow-hidden mb-[10px]">
            <div className="progress-bar bg-[#2563eb] h-full" style={{width: '50%'}}></div>
          </div>
        </div>
      </div>
    </div>
  )
} 