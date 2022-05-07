import * as THREE from "three";
import fs from 'fs';
import { kdTree } from "./kdTree.js";


const rawdata = fs.readFileSync('./ansys/pressureparser/result.json');
const stressFile = JSON.parse(rawdata);

const stressY = stressFile.map(el => el[0]);

const stressPosition = stressFile.map(el => [el[1], el[2], el[3]]);


const distanceFunction = function (a, b) {
    console.log(a,b)
    return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
}; 

const maxDistance = 10000; 

console.log(typeof kdTree)

let kdtree = new kdTree(stressPosition, distanceFunction, 3); 

let stress = [];

const res = kdtree.nearest(
    [50,20,30],
    1
);

console.log(res)

// const imagePositionsInRange = kdtree.nearest(
//     [
//         figurePointPosition[currentDataNumber].x,
//         figurePointPosition[currentDataNumber].y,
//         figurePointPosition[currentDataNumber].z
//     ],
//         1,
//         maxDis-tance
// );

// for (let i = 0; i < imagePositionsInRange.length; i++) { 
//     const object = imagePositionsInRange[i]; 
//     const objectPoint = new THREE.Vector3().fromArray(object[0].obj); 
//     const objectIndex = object[0].pos; 
//     stress[currentDataNumber] = stressValue[objectIndex];
// }
