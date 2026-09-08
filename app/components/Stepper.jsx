export default function Stepper({ steps = [], current = 1 }) {
  if (steps.length === 0) return null;

  return (
    <ol className="container stepper">
      {steps.map((s, i) => {
        const state = s.step < current ? 'is-done' : s.step === current ? 'is-current' : '';
        return (
          <li key={s.step} style={{ display: 'contents' }}>
            {i > 0 && (
              <span className={`step__bar${s.step <= current ? ' is-done' : ''}`} aria-hidden="true" />
            )}
            <span className={`step ${state}`}>
              <span className="step__dot">{s.step}</span>
              <span className="step__label">{s.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
