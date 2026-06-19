import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'

const schema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AddLawyerDialog({ onCreated }: { onCreated?: (l: any) => void }) {
  const { register, handleSubmit, reset } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)

  const onSubmit = async (data: FormData) => {
    try {
      setUploading(true)
      let profile_image = null

      // Upload photo if selected
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('lawyer-photos')
          .upload(fileName, photoFile, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('lawyer-photos')
            .getPublicUrl(fileName)
          profile_image = urlData.publicUrl
        }
      }

      const payload = {
        ...data,
        experience_years: data.experience_years ? Number(data.experience_years) : null,
        profile_image,
      }

      const res = await fetch('/api/lawyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const json = await res.json()
        onCreated?.(json)
        reset()
        setPhotoFile(null)
        setOpen(false)
      }
    } catch (err) {
      console.error('Error creating lawyer:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
        + Add Lawyer
      </Dialog.Trigger>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 z-50 shadow-xl max-h-[90vh] overflow-y-auto">
        <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">Add Lawyer</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <input {...register('name')} placeholder="Adv. John Smith"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Specialty</label>
            <input {...register('specialty')} placeholder="Criminal Law"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Experience (years)</label>
            <input {...register('experience_years', { valueAsNumber: true })} type="number" placeholder="10"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input {...register('email')} type="email" placeholder="lawyer@email.com"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input {...register('phone')} placeholder="9876543210"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none"
            />
            {photoFile && (
              <p className="text-xs text-green-600 mt-1">✅ {photoFile.name} selected</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Dialog.Close className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Dialog.Close>
            <button type="submit" disabled={uploading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
              {uploading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}