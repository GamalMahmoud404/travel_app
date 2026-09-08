import { toggleNotifyAction } from '../lib/actions';
import { Icon } from './iconMap';

export default function NotifyPrefs({ title, settings, off }) {
  const disabled = new Set(off ?? []);

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <h2 className="panel__head">{title}</h2>

      <div className="info-card__body">
        {settings.map((s) => {
          const on = !disabled.has(s.key);
          return (
            <form action={toggleNotifyAction} className="pref" key={s.key}>
              <input type="hidden" name="key" value={s.key} />

              <span className="pref__icon">
                <Icon name={s.icon} size={17} />
              </span>

              <span className="pref__text">
                <strong>{s.label}</strong>
                <span>{s.description}</span>
              </span>

              <button
                type="submit"
                className={`switch${on ? ' is-on' : ''}`}
                role="switch"
                aria-checked={on}
                aria-label={`${on ? 'إيقاف' : 'تشغيل'} ${s.label}`}
              >
                <span className="switch__knob" />
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
