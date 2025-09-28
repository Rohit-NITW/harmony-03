import React from 'react'
import { motion } from 'framer-motion'
import PeerSupport from '../components/PeerSupport'

export default function PeerSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PeerSupport />
        </motion.div>
      </div>
    </div>
  )
}