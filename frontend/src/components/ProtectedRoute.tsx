import React from 'react'
import { Navigate } from 'react-router-dom'

type Props = {
  user: any | null
  children: React.ReactNode
}

export default function ProtectedRoute({ user, children }: Props) {
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
