/* ==========================================================================
   هياكل تحميل — **غير مستخدمة حاليًا**.

   كانت تُعرض من ملفات loading.jsx في /account و/bookings و/booking و/admin،
   وحُذفت تلك الملفات: حدّ Suspense الذي ينشئه loading.jsx لا يُهيدرَت على
   Next 16.3.4 + React 19.2.8 عند **تحميل المسار مباشرة** (أو تحديث الصفحة)،
   فيظهر المحتوى بلا تفاعل — لا مرشّحات المفضلة ولا أزرار القلب ولا نماذج
   لوحة التحكم. التنقّل من داخل الموقع كان يعمل، والتحميل المباشر لا.

   تُعاد هذه الهياكل لحظة ما يُصلح ذلك في الإطار: أضف loading.jsx يستدعي
   المكوّن المناسب هنا، وتحقّق أن أزرار الصفحة تستجيب بعد تحديث الصفحة.
   ========================================================================== */

export function Line({ w = '100%', h = 14 }) {
  return <span className="sk" style={{ width: w, height: h }} />;
}

export function Block({ h = 120 }) {
  return <span className="sk sk--block" style={{ height: h }} />;
}

export function AccountSkeleton({ rows = 2 }) {
  return (
    <div className="container account">
      <aside className="panel acct-side">
        <div className="acct-side__user">
          <span className="sk sk--avatar" />
          <Line w="60%" />
          <Line w="40%" h={11} />
        </div>
        <div className="acct-side__nav">
          {Array.from({ length: 5 }).map((_, i) => (
            <Block h={40} key={i} />
          ))}
        </div>
      </aside>

      <section>
        <div className="pagehead">
          <Line w="180px" h={22} />
          <Line w="280px" h={12} />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div className="panel panel__pad" key={i} style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
            <Line w="40%" h={16} />
            <Block h={70} />
            <Block h={70} />
          </div>
        ))}
      </section>
    </div>
  );
}

export function ListSkeleton({ cards = 3 }) {
  return (
    <section className="container sect">
      <div className="sect__head">
        <Line w="220px" h={26} />
        <Line w="320px" h={13} />
      </div>
      <div style={{ marginTop: 34, display: 'grid', gap: 16 }}>
        {Array.from({ length: cards }).map((_, i) => (
          <Block h={140} key={i} />
        ))}
      </div>
    </section>
  );
}

export function FormSkeleton() {
  return (
    <div className="container checkout" style={{ paddingTop: 34 }}>
      <div className="form-section">
        <Block h={46} />
        <Block h={180} />
        <Block h={180} />
      </div>
      <Block h={420} />
    </div>
  );
}
