/* عنوان قسم مع خط زخرفي — يدعم تلوين جزء من العنوان بالأخضر المائي */
export default function SectionHead({ title, highlight, sub, id }) {
  let content = title;

  if (highlight && title.includes(highlight)) {
    const [before, after] = title.split(highlight);
    content = (
      <>
        {before}
        <em>{highlight}</em>
        {after}
      </>
    );
  }

  return (
    <div className="sect__head" id={id}>
      <h2 className="sect__title">{content}</h2>
      {sub && <p className="sect__sub">{sub}</p>}
      <span className="sect__rule" aria-hidden="true" />
    </div>
  );
}
