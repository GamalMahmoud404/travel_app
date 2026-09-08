import { deleteCardAction, setDefaultCardAction } from '../lib/actions';
import { CheckCircle, CreditCard, Star, Trash } from './Icons';

const brands = {
  visa: { label: 'VISA', cls: 'brandmark brandmark--visa' },
  mastercard: { label: 'MC', cls: 'brandmark brandmark--mc' },
  meeza: { label: 'ميزة', cls: 'brandmark brandmark--meeza' },
  card: { label: 'بطاقة', cls: 'brandmark' },
};

const pad = (n) => String(n).padStart(2, '0');

export default function CardList({ cards, title }) {
  return (
    <div className="panel">
      <h2 className="panel__head">
        <CreditCard size={18} />
        {title}
      </h2>

      <div className="info-card__body">
        {cards.length === 0 ? (
          <div className="empty" style={{ padding: '34px 20px' }}>
            <CreditCard size={34} />
            <p>لا توجد بطاقات محفوظة بعد.</p>
          </div>
        ) : (
          cards.map((card) => {
            const brand = brands[card.brand] ?? brands.card;
            return (
              <div className={`pay-card${card.isDefault ? ' is-default' : ''}`} key={card.id}>
                <span className={brand.cls}>{brand.label}</span>

                <div className="pay-card__info">
                  <strong dir="ltr">•••• •••• •••• {card.last4}</strong>
                  <span>{card.holder}</span>
                  <span dir="ltr">{pad(card.expMonth)} / {String(card.expYear).slice(-2)}</span>
                </div>

                <div className="pay-card__actions">
                  {card.isDefault ? (
                    <span className="tag tag--solid">
                      <Star size={12} />
                      البطاقة الافتراضية
                    </span>
                  ) : (
                    <form action={setDefaultCardAction}>
                      <input type="hidden" name="id" value={card.id} />
                      <button type="submit" className="btn btn--ghost">
                        <CheckCircle size={15} />
                        اجعلها افتراضية
                      </button>
                    </form>
                  )}

                  <form action={deleteCardAction}>
                    <input type="hidden" name="id" value={card.id} />
                    <button type="submit" className="btn btn--danger">
                      <Trash size={15} />
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
