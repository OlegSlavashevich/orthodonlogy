import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import { spawn } from 'child_process';
import path from 'path';

const PORT = 8000;
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.use(express.static(process.cwd()+"/geometry/"));

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 * 1024 * 1024 * 1024 },
}));

const translateGeometryName = (geometryName) => {
    const nameArray = geometryName.split('.');
    nameArray[0] += Date.now().toString();
    return nameArray.join('.');
};

app.post('/api/uploadGeometry', (req, res) => {
    const geometry = req.files.geometry;
    const geometryName = translateGeometryName(geometry.name);
    geometry.mv('./geometry/geometry.stl', (err) => {
        if (err) res.send(false);
        res.send(geometryName);
    });
});

app.get('/api/getGeometry/', (req, res) => {
    res.sendFile(`${process.cwd()}/geometry/geometry.stl`);
});

app.post('/api/generateMesh', (req, res) => {
    const geometryName = req.body.fileName;
    const young = req.body.young;
    const poisson = req.body.poisson;
    function runScript() {
        return spawn('python', [
              path.join(process.cwd(), 'mesher.py'),
              geometryName,
              young,
              poisson
        ]);
    }
    runScript();
    res.send(true);
});

app.get('/api/getMesh', (req, res) => {
    res.sendFile(`${process.cwd()}/mesh.stl`);
});

app.post('/api/generateFile', (req, res) => {
    // const coords = req.body.map((coord) => (
    //     `X:${coord.x}, Y:${coord.y}, Z:${coord.z}, FX:${coord.fx}, FY:${coord.fy}, FZ:${coord.fz}\n`
    // ));
    // fs.writeFile('info.txt', coords[0], (err) => {
    //     if (err) throw err;
    //     console.log('Saved!');
    // });
    // for (let i = 1; i < coords.length; i++) {
    //     fs.appendFile('info.txt', coords[i], (err) => {
    //         if (err) throw err;
    //         console.log('Saved!');
    //     });
    // } 
    res.end();
});

app.get('/api/getFile', (req, res) => {
    res.sendFile(`${process.cwd()}/apdlmesh.txt`);
});

app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
}); 