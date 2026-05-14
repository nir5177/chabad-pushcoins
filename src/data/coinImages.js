/**
 * Real Israeli New Shekel coin photos from Wikimedia Commons.
 *
 * These URIs are loaded at runtime by <Image source={{ uri }}>.
 * If an image fails to load, CoinButton falls back to its SVG illustration.
 *
 * To swap with locally-bundled images later, replace each URI string with
 * a `require('../../assets/coins/X.png')` import.
 */

export const COIN_IMAGES = {
  // ½ ש"ח — Lyre (כינור דוד)
  0.5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Israeli_half_sheqel_coin_obverse.png/240px-Israeli_half_sheqel_coin_obverse.png',

  // 1 ש"ח — Lily (שושן)
  1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Israel_1_NIS_obverse_2017.png/240px-Israel_1_NIS_obverse_2017.png',

  // 2 ש"ח — Cornucopias (קרני שפע)
  2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Israel_2_NIS_obverse.png/240px-Israel_2_NIS_obverse.png',

  // 5 ש"ח — Capital with palm leaves (כותרת עמוד)
  5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Israel_5_NIS_obverse.png/240px-Israel_5_NIS_obverse.png',

  // 10 ש"ח — Bimetallic, palm tree (תמר)
  10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Israel_10_NIS_obverse.png/240px-Israel_10_NIS_obverse.png',
};
