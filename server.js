const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const servicesPath = path.join(__dirname, 'services.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// פונקציה לניקוי מילות מפתח
function cleanKeyword(str) {
  return str.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');
}

app.post('/add-professional', (req, res) => {
  const { name, contact, phone, keywords } = req.body;

  if (!name || !keywords) {
    return res.status(400).send('חובה למלא שם ומילות מפתח');
  }

  const newKeywordsRaw = keywords.split(',').map(k => k.trim());
  const newKeywordsCleaned = newKeywordsRaw.map(cleanKeyword);

  let services = [];
  if (fs.existsSync(servicesPath)) {
    services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
  }

  const serviceIndex = services.findIndex(s => s.name.toLowerCase().trim() === name.trim().toLowerCase());

  if (serviceIndex !== -1) {
    const existingKeywordsRaw = services[serviceIndex].keywords;
    const existingKeywordsCleaned = existingKeywordsRaw.map(cleanKeyword);
    const addedKeywords = [];

    newKeywordsRaw.forEach((kw, i) => {
      const cleaned = newKeywordsCleaned[i];
      if (!existingKeywordsCleaned.includes(cleaned)) {
        services[serviceIndex].keywords.push(kw.trim());
        addedKeywords.push(kw.trim());
      }
    });

    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), 'utf8');

    if (addedKeywords.length > 0) {
      return res.send(`<h2>עודכנו מילות מפתח חדשות לשירות "${name}": ${addedKeywords.join(', ')}</h2><a href="/add-professional-form-protected.html">חזרה לטופס</a>`);
    } else {
      return res.send(`<h2>⚠️ לא נוספו מילות מפתח – כל המילים כבר קיימות.</h2><a href="/add-professional-form-protected.html">חזרה לטופס</a>`);
    }
  }

  const newService = {
    name: name.trim(),
    title: name.trim(),
    keywords: newKeywordsRaw,
    contact: contact.trim(),
    location: phone.trim(),
    note: "",
    whatsapp_id: ""
  };

  services.push(newService);
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), 'utf8');

  res.send(`<h2>השירות "${newService.title}" נוסף בהצלחה!</h2><a href="/add-professional-form-protected.html">חזרה לטופס</a>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
