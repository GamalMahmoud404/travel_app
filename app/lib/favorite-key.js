/** مُعرّف عنصر المفضلة — وحدة نقية يستوردها الخادم والمتصفح على حدٍّ سواء */
export const favoriteKey = (kind, slug) => `${kind}:${slug}`;
