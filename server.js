import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import { execSync, spawn } from 'child_process';
import path from 'path';
import { exec } from "child_process";

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
    fs.appendFileSync('ansys/result/Root.bat', '/batch\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/filename, Root_Cycle_FZ\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '!\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*CREATE,res1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*cfopen,Results_StressesOnly,txt,,append\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*vwrite,nx,ny,nz,ux,uy,uz\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', "(F11.7,',',F11.7,',',F11.7,',',F13.11,',',F13.11,',',F13.11)\n", (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*cfclos\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*END\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    res.send(true);
});

app.get('/api/getMesh', (req, res) => {
    res.sendFile(`${process.cwd()}/mesh.stl`);
});

app.get('/api/getNodes', (req, res) => {
    const apdlMesh = fs.readFileSync('./apdlmesh.txt','utf-8');
    fs.appendFileSync('ansys/result/Root.bat', apdlMesh, (err) => {
        if (err) throw err;
    });
    res.sendFile(`${process.cwd()}/nodes.json`)
})

app.post('/api/addCommand', (req, res) => {
    const commands = req.body.commands;
    for (let i = 0; i < commands.length; i++) {
        fs.appendFile('ansys/result/Root.bat', commands[i], (err) => {
            if (err) throw err;
            console.log('Saved!');
        });
    }
    res.end();
});

app.get('/api/getFile', (req, res) => {
    fs.appendFileSync('ansys/result/Root.bat', 'FINISH\n', (err) => {
        if (err) throw err;
        console.log('Saved!'); 
    });
    fs.appendFileSync('ansys/result/Root.bat', '/SOL\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/STATUS,SOLU\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'SOLVE\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'FINISH\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/POST1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '!*\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/EFACET,1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'PLNSOL, S,EQV, 0,1.0\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'allsel,all\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nn,NODE,,COUNT, , , ,\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*do,i,1,nn,1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nr,NODE,,NUM,MIN, , , ,\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nx,NODE,nr,LOC,x\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '*GET,ny,NODE,nr,LOC,y\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nz,NODE,nr,LOC,z\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,ux,NODE,nr,U,x\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,uy,NODE,nr,U,y\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,uz,NODE,nr,U,z\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '!\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*use,res1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'NSEL,U,,,nr\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '*enddo\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'allsel,all\n', (err) => {
        if (err) throw err;
    });
    res.sendFile(`${process.cwd()}/ansys/result/Root.bat`);
});

app.get('/api/calculate', (req, res) => {
    fs.appendFileSync('ansys/result/Root.bat', 'FINISH\n', (err) => {
        if (err) throw err;
        console.log('Saved!'); 
    });
    fs.appendFileSync('ansys/result/Root.bat', '/SOL\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/STATUS,SOLU\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'SOLVE\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'FINISH\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/POST1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '!*\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '/EFACET,1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'PLNSOL, S,EQV, 0,1.0\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'allsel,all\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nn,NODE,,COUNT, , , ,\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*do,i,1,nn,1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nr,NODE,,NUM,MIN, , , ,\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nx,NODE,nr,LOC,x\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '*GET,ny,NODE,nr,LOC,y\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,nz,NODE,nr,LOC,z\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,ux,NODE,nr,U,x\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,uy,NODE,nr,U,y\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*GET,uz,NODE,nr,U,z\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '!\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '*use,res1\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'NSEL,U,,,nr\n', (err) => {
        if (err) throw err;
    });

    fs.appendFileSync('ansys/result/Root.bat', '*enddo\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', '\n', (err) => {
        if (err) throw err;
    });
    fs.appendFileSync('ansys/result/Root.bat', 'allsel,all\n', (err) => {
        if (err) throw err;
    });
    exec('cd ansys/result & "D:\\Ansys17\\ANSYS Inc\\v172\\ansys\\bin\\winx64\\ANSYS172.exe" -b -i "Root.bat" -o "test.out"', (error, stdout, stderr) => {
        exec('cd ansys/pressureparser & python main.py', (error, stdout, stderr) => {
            res.sendFile(`${process.cwd()}/ansys/pressureparser/result.json`);
            setTimeout(() => {
                fs.unlinkSync(`${process.cwd()}/ansys/pressureparser/result.json`);
                fs.unlinkSync(`${process.cwd()}/ansys/result/Results_StressesOnly.txt`);
                fs.unlinkSync(`${process.cwd()}/ansys/result/test.out`);
            }, 7000);
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
}); 