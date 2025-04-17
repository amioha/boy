const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const servicesPath = path.join(__dirname, 'services.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // כדי להגיש את קובץ ה-HTML

app.post('/add-professional', (req, res) => {
  const { name, contact, phone, keywords } = req.body;

  if (!name || !keywords) {
    return res.status(400).send('חובה למלא שם ומילות מפתח');
  }

  const newService = {
    name: name.trim(),
    title: name.trim(),
    keywords: keywords.split(',').map(k => k.trim()),
    contact: contact.trim(),
    location: phone.trim(),
    note: "",
    whatsapp_id: ""
  };

  let services = [];
  if (fs.existsSync(servicesPath)) {
    services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
  }

  services.push(newService);
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), 'utf8');

  res.send(`<h2>השירות "${newService.title}" נוסף בהצלחה!</h2><a href="/add-professional-form-protected.html">חזרה לטופס</a>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
