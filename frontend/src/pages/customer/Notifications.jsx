import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Loader, EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { timeAgo } from '../../utils/format';
import { cn } from '../../utils/cn';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    notificationService.getNotifications()
      .then(setNotifications)
      .catch((err) => toast({ type: 'error', title: 'Could not load notifications', message: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    setMarking(true);
    try {
      await notificationService.markAllAsRead();
      toast({ type: 'success', title: 'All notifications marked as read' });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not update notifications', message: err.message });
    } finally {
      setMarking(false);
    }
  };

  const markOne = async (id) => {
    await notificationService.markAsRead(id);
    load();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <Loader label="Loading notifications..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up.'}
        action={unreadCount > 0 && <Button variant="secondary" icon={CheckCheck} loading={marking} onClick={markAll}>Mark all as read</Button>}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Updates about your appointments and services will show up here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={cn('cursor-pointer', !n.read && 'border-cyan-400/20 bg-cyan-400/[0.03]')} onClick={() => !n.read && markOne(n.id)}>
              <div className="flex items-start gap-3">
                <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', !n.read ? 'bg-cyan-400' : 'bg-transparent')} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{n.message}</p>
                  <p className="mt-1.5 text-xs text-ink-faint">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
