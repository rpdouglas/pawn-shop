import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from './firebase'
import { useAuth } from '../context/AuthContext'
import type { LoanTicket } from './types'

function tsToDate(v: unknown): Date | undefined {
  if (v instanceof Timestamp) return v.toDate()
  if (v instanceof Date) return v
  return undefined
}

function toTicket(docId: string, raw: Record<string, unknown>): LoanTicket {
  return {
    ...raw,
    id: docId,
    dueDate: tsToDate(raw['dueDate']) ?? new Date(),
    signedAt: tsToDate(raw['signedAt']),
    createdAt: tsToDate(raw['createdAt']) ?? new Date(),
    updatedAt: tsToDate(raw['updatedAt']) ?? new Date(),
  } as LoanTicket
}

export function useCustomerLoanTickets() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['loanTickets', 'customer', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      const q = query(collection(db, 'loanTickets'), where('uid', '==', user.uid))
      const snap = await getDocs(q)
      return snap.docs.map(doc => toTicket(doc.id, doc.data() as Record<string, unknown>))
    },
    enabled: !!user?.uid,
    staleTime: 60 * 1000
  })
}

export function useAllLoanTickets() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['loanTickets', 'all'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'loanTickets'))
      return snap.docs.map(doc => toTicket(doc.id, doc.data() as Record<string, unknown>))
    },
    enabled: !!user?.isStaff,
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

export interface IssueLoanArgs {
  pawnRequestId: string
  loanAmount: number
  periodDays: number
  interestRate: number
  itemId?: string
  agreedItemValue?: number
  idType?: string
  idVerified?: boolean
}

export interface IssueLoanResult {
  success: boolean
  loanTicketId: string
  ticketNumber: string
  dueDate: string
}

export function useIssueLoanTicket() {
  const queryClient = useQueryClient()
  const issueFn = httpsCallable<IssueLoanArgs, IssueLoanResult>(functions, 'createLoanTicket')

  return useMutation({
    mutationFn: async (args: IssueLoanArgs) => {
      return (await issueFn(args)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanTickets'] })
      queryClient.invalidateQueries({ queryKey: ['pawnRequests'] })
    },
  })
}

export function useRedeemLoan() {
  const queryClient = useQueryClient()
  const redeemFn = httpsCallable<
    { loanTicketId: string; paymentIntentId?: string; redemptionAmount?: number },
    { success: boolean }
  >(functions, 'redeemLoanTicket')

  return useMutation({
    mutationFn: async (args: { loanTicketId: string; paymentIntentId?: string; redemptionAmount?: number }) => {
      await redeemFn(args)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanTickets'] })
    },
  })
}

export function useForfeitLoan() {
  const queryClient = useQueryClient()
  const forfeitFn = httpsCallable<{ loanTicketId: string }, { success: boolean }>(functions, 'forfeitLoan')

  return useMutation({
    mutationFn: async (loanTicketId: string) => {
      await forfeitFn({ loanTicketId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanTickets'] })
    }
  })
}

export function useSignPawnAgreement() {
  const queryClient = useQueryClient()
  const signFn = httpsCallable<
    { loanTicketId: string; signatureDataUrl: string; customerName: string; agreementVersion: string },
    { signatureUrl: string }
  >(functions, 'signPawnAgreement')

  return useMutation({
    mutationFn: async (args: { loanTicketId: string; signatureDataUrl: string; customerName: string; agreementVersion: string }) => {
      return (await signFn(args)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanTickets'] })
    }
  })
}
