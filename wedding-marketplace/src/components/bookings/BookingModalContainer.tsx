'use client'

import { useState } from 'react'
import BookingModal from './BookingModal'

interface PackageOption {
  _id: string
  name: string
  price: number
}

interface BookingModalContainerProps {
  vendorId: string
  vendorName: string
  packages: PackageOption[]
}

export default function BookingModalContainer({ vendorId, vendorName, packages }: BookingModalContainerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full py-4 bg-[var(--burgundy)] text-white font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-[var(--burgundy-dk)] transition-colors shadow-lg shadow-[var(--burgundy)]/20"
      >
        Request Quote
      </button>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendorId={vendorId}
        vendorName={vendorName}
        packages={packages}
      />
    </>
  )
}
