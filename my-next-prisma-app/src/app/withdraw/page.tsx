"use client";
import React from 'react';

export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Withdraw Earnings
        </h1>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Balance Overview */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Balance</h2>
              <div className="bg-white/5 p-6 rounded-xl">
                <p className="text-lg text-white/70">Available to Withdraw</p>
                <p className="text-5xl font-bold text-green-400 mt-2">
                  ₹5,400
                </p>
                <p className="text-sm text-white/50 mt-2">
                  (Total Earnings: ₹7,800)
                </p>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Request Withdrawal</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1 text-white/80">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., 2500"
                    min="2000"
                  />
                   <p className="text-xs text-white/50 mt-1">Minimum withdrawal amount is ₹2000.</p>
                </div>
                <div>
                  <label htmlFor="method" className="block text-sm font-medium mb-1 text-white/80">
                    Withdrawal Method
                  </label>
                  <select
                    id="method"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option>UPI</option>
                    <option>PayPal</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
                <div>
                   <label htmlFor="details" className="block text-sm font-medium mb-1 text-white/80">
                    Details (UPI ID, PayPal email, etc.)
                  </label>
                  <input
                    type="text"
                    id="details"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Enter your payment details"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 