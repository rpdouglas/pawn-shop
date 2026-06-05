import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from './firebase'
import { useAuth } from '../context/AuthContext'
import type { LoanTicket } from './types'

export function useCustomerLoanTickets() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['loanTickets', 'customer', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      const q = query(collection(db, 'loanTickets'), where('uid', '==', user.uid))
      const snap = await getDocs(q)
      return snap.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as LoanTicket
      })
    },
    enabled: !!user?.uid,
    staleTime: 60 * 1000
  })
}

export function useAllLoanTickets() {
  return useQuery({
    queryKey: ['loanTickets', 'all'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'loanTickets'))
      return snap.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as LoanTicket
      })
    },
    staleTime: 60 * 1000
  })
}

export function useRequestExtension() {
  const queryClient = useQueryClient()
  const requestExtensionFn = httpsCallable<{ loanTicketId: string }, { success: boolean }>(functions, 'requestExtension')

  return useMutation({
    mutationFn: async (loanTicketId: string) => {
      await requestExtensionFn({ loanTicketId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanTickets'] })
    }
  })
}

export function useProcessExtension() {
  const queryClient = useQueryClient()
  const processExtensionFn = httpsCallable<{ loanTicketId: string, approved: boolean, newDueDate?: string, staffNotes?: string }, { success: boolean }>(functions, 'processExtension')

  return useMutation({
    mutationFn: async (args: { loanTicketId: string, approved: boolean, newDueDate?: string, staffNotes?: string }) => {
      await processExtensionFn(args)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanTickets'] })
    }
  })
}
