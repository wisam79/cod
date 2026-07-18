import React from 'react';
import { WifiOff, Loader2, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { triggerHaptic } from '../../utils/haptics';

export default function ConnectionStatusBar() {
  const isOffline = useAppStore(s => s.isOffline);
  const wsStatus = useAppStore(s => s.wsStatus);
  const initWebSocket = useAppStore(s => s.initWebSocket);

  const isVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');

  return (
    <div className="connection-status-bars">
      {isOffline && (
        <div className="status-bar offline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <WifiOff size={14} />
          أنت تعمل في وضع عدم الاتصال (Offline)
        </div>
      )}
      {!isOffline && wsStatus === 'connecting' && !isVercel && (
        <div className="status-bar connecting" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          جاري إعادة اتصال البث المباشر...
        </div>
      )}
      {!isOffline && wsStatus === 'disconnected' && !isVercel && (
        <div className="status-bar disconnected" onClick={() => { initWebSocket(); triggerHaptic('medium'); }} role="button" tabIndex={0} aria-label="إعادة الاتصال بالبث المباشر" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Activity size={14} />
          انقطع البث المباشر. اضغط لإعادة الاتصال
        </div>
      )}
    </div>
  );
}
