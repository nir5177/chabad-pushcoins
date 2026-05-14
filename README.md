# בית חב״ד קרית בורוכוב ותל גנים — PushCoins App

אפליקציית קופת צדקה דיגיטלית לבית חב״ד.

## איך זה עובד

1. המשתמש רואה תמונת קופת צדקה (פושקה) כחולה עם לוגו חב״ד
2. בוחר מטבע: ½₪ / ₪1 / ₪5 / ₪10
3. המטבע נופל לתוך הפושקה עם **צליל מתכתי** ו-**הרטטת טלפון**
4. הסכום מצטבר במונה
5. לחיצה על "תרום X ₪" — פותח Bit עם המספר והסכום

## הרצה מקומית

```bash
cd chabad-pushcoins
npm install
npx expo start
```

סרקו את ה-QR עם **Expo Go** מהטלפון.

## מבנה הפרויקט

```
chabad-pushcoins/
├── App.js                          # Entry point
├── app.json                        # Expo config
├── src/
│   ├── screens/
│   │   └── HomeScreen.js           # מסך ראשי (פושקה + מטבעות + Bit)
│   └── components/
│       ├── Pushke.js               # SVG קופת צדקה
│       ├── CoinButton.js           # מטבעות SVG לחיצים
│       └── AudioEngine.js          # מנוע צלילים (Web Audio API)
```

## בניית APK (קובץ התקנה לאנדרואיד)

הבנייה מתבצעת בענן של Expo (EAS Build) — לוקח ~15-25 דקות, ובסיום מקבלים קישור להורדה של ה-APK.

**שלב 1 — חשבון Expo חינמי:**

הירשמו ב-https://expo.dev (חינם).

**שלב 2 — התקנת ה-CLI:**

```bash
npm install -g eas-cli
```

**שלב 3 — בנייה:**

```bash
cd chabad-pushcoins
npm install
eas login                           # הזינו את פרטי החשבון שיצרתם
eas build:configure                 # פעם ראשונה בלבד
npm run build:apk                   # בונה APK בענן (~20 דק׳)
```

בסיום, EAS תיתן קישור הורדה. שלחו אותו לטלפון, הורידו והתקינו (יש לאשר "התקנה ממקור לא ידוע").

**לבניית AAB ל-Google Play:**

```bash
npm run build:aab
```

**לבניית iOS (דורש חשבון Apple Developer בעלות 99$ לשנה):**

```bash
npm run build:ios
```

## שלבים הבאים

- [ ] להחליף את `BIT_PHONE` ב-`PaymentScreen.js` אם המספר ישתנה
- [ ] כשתיפתח עמותה — להוסיף Cardcom / Tranzila / Stripe לסליקה
- [ ] להחליף את `assets/icon.png` בלוגו רשמי של בית חב״ד
- [ ] לפרסם ב-Google Play (דרך `npm run build:aab` + `eas submit`)

## פרטי Bit

מספר לתרומה: **0508100010**
