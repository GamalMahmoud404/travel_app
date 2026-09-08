import AccountSidebar from '../../components/AccountSidebar';
import { safeMetadata } from '../../lib/metadata';
import NotificationList from '../../components/NotificationList';
import NotifyPrefs from '../../components/NotifyPrefs';
import { Bell } from '../../components/Icons';
import { requirePermission } from '../../lib/permissions';
import {
  getAccountNav,
  getNotificationSettings,
  getNotifications,
  getSectionCopy,
  getSite,
  getUnreadCount,
} from '../../lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['account.notifications'].title} — ${site.name}` };
  });
}

export default async function NotificationsPage() {
  const { user, permissions, roleLabel } = await requirePermission('bookings.own', '/account/notifications');
  const [nav, copy, notifications, unread, settings] = await Promise.all([
    getAccountNav(),
    getSectionCopy(),
    getNotifications(user.id),
    getUnreadCount(user.id),
    getNotificationSettings(),
  ]);
  const head = copy['account.notifications'];

  return (
    <div className="container account">
      <AccountSidebar user={user} nav={nav} permissions={permissions} roleLabel={roleLabel} />

      <section>
        <div className="pagehead">
          <div className="pagehead__row">
            <Bell size={19} />
            <h1>{head.title}</h1>
          </div>
          <p>{head.sub}</p>
        </div>

        <NotificationList
          title={copy['account.notify.inbox'].title}
          notifications={notifications}
          unread={unread}
        />

        <NotifyPrefs
          title={copy['account.notify.channels'].title}
          settings={settings.channels}
          off={user.notifyOff}
        />

        <NotifyPrefs
          title={copy['account.notify.topics'].title}
          settings={settings.topics}
          off={user.notifyOff}
        />
      </section>
    </div>
  );
}
