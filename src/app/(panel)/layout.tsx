import { ReactNode } from 'react';
import { Shell } from '@/components/Shell';

// Everything inside (panel) sits behind the admin sign-in guard.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
