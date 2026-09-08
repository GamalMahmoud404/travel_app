/**
 * وسائط الصفحات (generateMetadata) تعمل خارج حدود الخطأ في Next،
 * فرميُها يُسقط الصفحة كلها. هذا الغلاف يعيد وسائط بديلة عند تعذّر القاعدة.
 */
export async function safeMetadata(build, fallbackTitle = 'رحلتي') {
  try {
    return await build();
  } catch {
    return { title: fallbackTitle };
  }
}
