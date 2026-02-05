import { createClient } from '@/lib/supabase/client';

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_TRANSACTION'
  | 'UPDATE_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'CREATE_WALLET'
  | 'UPDATE_WALLET'
  | 'DELETE_WALLET'
  | 'EXPORT_DATA'
  | 'DELETE_ACCOUNT';

export type AuditEntity = 'USER' | 'TRANSACTION' | 'WALLET' | 'BUDGET' | 'SYSTEM';

interface AuditLogParams {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: Record<string, unknown> | null;
}

export const logActivity = async ({ action, entity, entityId, details }: AuditLogParams) => {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return; // No user to log

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity,
      entity_id: entityId,
      details,
      user_agent: window.navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Fail silently to not disrupt user flow
  }
};
