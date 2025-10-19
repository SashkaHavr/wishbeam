import { createContext, use } from 'react';

export const LoginDialogContext = createContext<{
  openLoginDialog: () => void;
} | null>(null);

export function useLoginDialog() {
  const context = use(LoginDialogContext);
  if (!context) {
    throw new Error('useLoginDialog must be used within a LoginDialogProvider');
  }
  return context;
}
