async function mishnayotSurveyHandler(client, message) {
    const masechtot = {
        "זרעים": ["ברכות", "פאה", "דמאי", "כלאים", "שביעית", "תרומות", "מעשרות", "מעשר שני", "חלה", "ערלה", "ביכורים"],
        "מועד": ["שבת", "עירובין", "פסחים", "שקלים", "יומא", "סוכה", "ביצה", "ראש השנה", "תענית", "מגילה", "מועד קטן", "חגיגה"],
        "נשים": ["יבמות", "כתובות", "נדרים", "נזיר", "סוטה", "גיטין", "קידושין"],
        "נזיקין": ["בבא קמא", "בבא מציעא", "בבא בתרא", "סנהדרין", "מכות", "שבועות", "עדויות", "עבודה זרה", "אבות", "הוריות"],
        "קדשים": ["זבחים", "מנחות", "חולין", "בכורות", "ערכין", "תמורה", "כריתות", "מעילה", "תמיד", "מידות", "קינים"],
        "טהרות": ["כלים", "אהלות", "נגעים", "פרה", "טהרות", "מקוואות", "נידה", "מכשירין", "זבים", "טבול יום", "ידים", "עוקצים"]
    };

    try {
        for (const [seder, masechtotList] of Object.entries(masechtot)) {
            let surveyText = `📖 *סקר משניות - סדר ${seder}*

`;
            masechtotList.forEach(masechet => {
                surveyText += `▫️ ${masechet}\n`;
            });
            
            await client.sendText(message.from, surveyText);
        }
    } catch (error) {
        console.error("Error sending mishnayot survey:", error);
        await client.sendText(message.from, "❌ אירעה שגיאה בשליחת סקר המשניות. נסה שוב מאוחר יותר.");
    }
}

export default mishnayotSurveyHandler;
