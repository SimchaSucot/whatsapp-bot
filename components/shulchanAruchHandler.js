import axios from 'axios';
import cheerio from 'cheerio';

let userState = {}; // לשמור את מצב המשתמשים

const partMapping = {
  'אורח חיים': 'Orach Chayim',
  'יורה דעה': 'Yoreh De\'ah',
  'אבן העזר': 'Even HaEzer',
  'חושן משפט': 'Choshen Mishpat'
};

const hebrewNumbers = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
  'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60,
  'ע': 70, 'פ': 80, 'צ': 90, 'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400, 'ך': 20, 'ם': 40, 'ן': 50,
  'ף': 80, 'ץ': 90
};

function hebrewToNumber(hebrew) {
  let number = 0;
  for (let char of hebrew) {
    number += hebrewNumbers[char] || 0;
  }
  return number;
}

async function shulchanAruchHandler(client, message, userState) {
  if (!message.from || !message.body) {
    console.error('Error: message.from or message.body is undefined.');
    return;
  }

  const user = message.from;
  if (!userState[user]) {
    userState[user] = { step: 1 };
  }

  try {
    switch (userState[user].step) {
      case 1:
        await client.sendText(user, 'איזה חלק? (אורח חיים, יורה דעה, אבן העזר, חושן משפט)');
        userState[user].step = 2;
        break;

      case 2:
        const partOptions = Object.keys(partMapping);
        if (partOptions.includes(message.body.trim())) {
          userState[user].part = message.body.trim();
          await client.sendText(user, 'איזה סימן?');
          userState[user].step = 3;
        } else {
          await client.sendText(user, 'תשובה לא מתאימה. אנא בחר אחד מהחלקים הבאים: אורח חיים, יורה דעה, אבן העזר, חושן משפט.');
        }
        break;

      case 3:
        userState[user].siman = message.body.trim();
        await client.sendText(user, 'איזה סעיף?');
        userState[user].step = 4;
        break;

      case 4:
        userState[user].saif = message.body.trim();
        const { part, siman, saif } = userState[user];
        const englishPart = partMapping[part];
        const simanNumber = hebrewToNumber(siman);
        const saifNumber = hebrewToNumber(saif);
        const response = await axios.get(`https://www.sefaria.org/api/texts/Shulchan_Arukh,_${englishPart}.${simanNumber}?lang=he`);
        
        // שימוש ב-cheerio כדי לשלוף את הטקסט הנקי מהתגובה של ה-API
        const $ = cheerio.load(response.data.he);
        let saifText = '';
        $('br').each((i, elem) => {
          if (i === saifNumber - 1) {
            saifText = $(elem).next().text().trim();
            return false; // עוצר את הלולאה לאחר שמצאנו את הסעיף
          }
        });

        if (!saifText) {
          saifText = 'לא נמצא סעיף מתאים.';
        }

        await client.sendText(user, `*סעיף ${saif} בסימן ${siman} חלק ${part}:*\n${saifText}`);
        delete userState[user]; // איפוס מצב המשתמש
        break;

      default:
        await client.sendText(user, 'הייתה בעיה בשליחת ההודעה שלך.');
        break;
    }
  } catch (error) {
    console.error('Error handling Shulchan Aruch message:', error);
    await client.sendText(user, 'הייתה בעיה בשליחת ההודעה שלך.');
    delete userState[user]; // איפוס מצב המשתמש במקרה של שגיאה
  }
}

export default shulchanAruchHandler;
