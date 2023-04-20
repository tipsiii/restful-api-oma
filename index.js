const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const path = require('path');
const fs = require('fs');

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');

app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, 'public')));

var index = 0;
var data = [];

// Luetaan data filusta
// Lisätään dataan id:t -- ei järkevää tässä, mutta nyt ei voi mitään ---
fs.readFile('./data/iris.json', (err, read) => {
    if (err) throw err;
    data = JSON.parse(read);
    data.forEach(item => {
        item.id = index;
        index++;
    });
});

// Reititys:
app.get('/', (req, res) => {
    // res.send('Handlebars is kylläkyllä!');
    res.render('index',
        {
            page_title: 'Tere tulemast',

        });
});

app.get('/about', (req, res) => {
    res.render('about', {
        page_title: 'About',
    });
});

app.get('/samples', (req, res) => {
    res.render('samples', {
        page_title: 'Näytteet',
        desc: 'Tässä on listattuna kaikki näytteet, olkaa hyvä.',
        samples : data
    });
});


// GET kaikki resurssit
app.get('/api/irises', (req, res) => {
    res.json(data);
});

// GET resurssi id:n perusteella
app.get('/api/irises/:id', (req, res) => {
    const id = Number(req.params.id); // muunnetaan id numeroksi
    const sample = data.find(sample => sample.id === id);

    if (sample) {
        res.json(sample); // res.status(200).json(product); voitasiin käyttää myös. 200 on oletustila
    }
    else {
        res.status(404).json(
            {
                msg: 'Not found' // tämä on 404:n oletusviesti
            }
        );
    }
});

// DELETE resurssi id:n perusteella
app.delete('/api/irises/:id', (req, res) => {
    const id = Number(req.params.id);
    const sample = data.find(sample => sample.id === id);
    if (isNaN(req.params.id) || id < 0) {
        res.status(400).json({ msg: 'Bad request' });
    }
    else if (!sample) {
        res.status(404).json({ msg: 'Not found' });
    }
    else {
        // Suodatetaan haluttu id pois ja ylikirjoitetaan data-taulukko
        data = data.filter(sample => sample.id !== id);
        res.status(204).json({});
    };
});

// CREATE resurssi
app.post('/api/irises', (req, res) => {
    // console.log(req.body);  req.body on undefined jos emme tuo app.use(express.json()) mukaan 
    // res.send("ok");

    // Tarkistetaan onko kaikki tiedot saatu requestin mukana
    if (!req.body.sepalLength || !req.body.sepalWidth || !req.body.petalLength || !req.body.petalWidth || !req.body.species) {
        res.status(400).json({ msg: 'Error - information missing' });
    }
    else { 
        const newSample = {
            sepalLength: req.body.sepalLength,
            sepalWidth: req.body.sepalWidth,
            petalLength: req.body.petalLength,
            petalWidth: req.body.petalWidth,
            species: req.body.species,
            id: data.length,
        }
        data.push(newSample);

        // Uuden näytteen sijainti otsikkotietona
        const url = `${req.protocol}://${req.get('host')}${req.originalUrl}/${newSample.id}`;
        res.location(url);
        // Lähetettän uuden näytteen tiedot RESTful APIn tapojen mukaisesti
        res.status(201).json(newSample);
    }
});

// UPDATE reusrssi
app.patch('/api/irises/:id', (req, res) => {
    const idToUpdate = Number(req.params.id);
    const sample = data.find(sample => sample.id === idToUpdate);
    if (sample){
        sample.sepalLength = req.body.sepalLength;
        sample.sepalWidth = req.body.sepalWidth;
        sample.petalLength = req.body.petalLength;
        sample.petalWidth = req.body.petalWidth;
        sample.species = req.body.species;
        patchedSample = {
            sepalLength: sample.sepalLength,
            sepalWidth: sample.sepalWidth,
            petalLength: sample.petalLength,
            petalWidth: sample.petalWidth,
            species: sample.species,
            id: sample.id,
        };
        res.status(200).json(patchedSample); 
    }

    else { 
        res.status(404).json({ msg: 'Not found' });
    }
    });

// Portti(env.PORT tai 5000) ja serverin käynnistys
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));