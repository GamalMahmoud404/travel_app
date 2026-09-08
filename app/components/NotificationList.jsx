import { deleteNotificationAction, markAllReadAction } from '../lib/actions';
import { Bell, CheckCircle, Tag, Ticket, Trash } from './Icons';

const kindIcons = { booking: Ticket, offer: Tag, system: Bell };

const when = (date) => {
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 60) return `قبل ${Math.max(mins, 1)} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  return `قبل ${Math.round(hours / 24)} يوم`;
};

export default function NotificationList({ title, notifications, unread }) {
  return (
    <div className="panel">
      <div className="info-card__head">
        <h2>
          <Bell size={18} />
          {title}
          {unread > 0 && <span className="badge-count">{unread}</span>}
        </h2>

        {unread > 0 && (
          <form action={markAllReadAction}>
            <button type="submit" className="btn btn--ghost">
              <CheckCircle size={15} />
              تعليم الكل كمقروء
            </button>
          </form>
        )}
      </div>

      <div className="info-card__body">
        {notifications.length === 0 ? (
          <div className="empty" style={{ padding: '34px 20px' }}>
            <Bell size={34} />
            <p>لا توجد إشعارات حاليًا.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const KindIcon = kindIcons[n.kind] ?? Bell;
            return (
              <article className={`notif${n.read ? '' : ' is-unread'}`} key={n.id}>
                <span className={`notif__icon notif__icon--${n.kind}`}>
                  <KindIcon size={17} />
                </span>

                <div className="notif__body">
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                  <span className="notif__time">{when(n.createdAt)}</span>
                </div>

                <form action={deleteNotificationAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className="notif__del" aria-label="حذف الإشعار">
                    <Trash size={15} />
                  </button>
                </form>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
