import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export function useStoreConfig(configId: 'storeHours' | 'shopInfo') {
  return useQuery({
    queryKey: ['storeConfig', configId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'config', configId))
      if (!snap.exists()) {
        throw new Error(`Config ${configId} not found`)
      }
      return snap.data()
    },
    // Global configs rarely change, keep fresh for a long time
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}
