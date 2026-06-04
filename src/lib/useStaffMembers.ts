import { useQuery } from '@tanstack/react-query'
import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import type { StaffMember } from './types'

const getStaffMembersFn = httpsCallable<unknown, { staff: StaffMember[] }>(functions, 'getStaffMembers')

export function useStaffMembers() {
  return useQuery({
    queryKey: ['staffMembers'],
    queryFn: async () => {
      const response = await getStaffMembersFn()
      return response.data.staff
    },
    // Staff roster rarely changes, keep it fresh for a while
    staleTime: 5 * 60 * 1000, 
  })
}
