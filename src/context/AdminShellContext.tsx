import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface AdminShellContextValue {
  isAdminDesktop: boolean;
}

const AdminShellContext = createContext<AdminShellContextValue>({ isAdminDesktop: false });

export function AdminShellProvider({ children, value }: { children: ReactNode; value: AdminShellContextValue }) {
  return (
    <AdminShellContext.Provider value={value}>
      {children}
    </AdminShellContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminShell() {
  return useContext(AdminShellContext);
}
