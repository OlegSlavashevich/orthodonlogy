import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

const PORT = 8000;
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.post('/api/generate', (req, res) => {
    const coords = req.body.map((coord) => (
        `X:${coord.x}, Y:${coord.y}, Z:${coord.z}, FX:${coord.fx}, FY:${coord.fy}, FZ:${coord.fz}\n`
    ));
    fs.writeFile('info.txt', coords[0], (err) => {
        if (err) throw err;
        console.log('Saved!');
    });
    for (let i = 1; i < coords.length; i++) {
        fs.appendFile('info.txt', coords[i], (err) => {
            if (err) throw err;
            console.log('Saved!');
        });
    } 
    res.end();
});

app.get('/api/fetch', (req, res) => {
    res.sendFile(`${process.cwd()}/info.txt`);
});

app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
}); 