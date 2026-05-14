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

## שלבים הבאים

- [ ] להחליף `BIT_PHONE` ב-`HomeScreen.js` אם המספר ישתנה
- [ ] כשתיפתח עמותה — להוסיף Cardcom / Tranzila / Stripe לסליקה
- [ ] להוסיף לוגו מותאם אישית (החלף `assets/icon.png`)
- [ ] לפרסם ב-App Store ו-Google Play (דרך `eas build`)

## פרטי Bit

מספר לתרומה: **0508100010**
