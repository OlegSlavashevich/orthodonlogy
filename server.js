import express from 'express';
import bodyParser from 'body-parser';

const PORT = 8000;
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

const array = [1, 2, 3];

app.get('/api', (req, res) => {
    res.status(200)
        .attachment('test.txt')
        .send(array)
        .send(array);
});

app.get('/api/getFile', (req, res) => {
    res.download(process.cwd() + '/files/test.txt');
});

app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
}); 