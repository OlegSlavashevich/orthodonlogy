import React, { Suspense, useState } from "react";
import { Canvas } from "react-three-fiber";
import { Vector3 } from 'three';
import { OrbitControls } from "@react-three/drei";
import './App.css';
import Model from './components/Model';
import { Button, Layout, Spin, Typography } from 'antd';
import "antd/dist/antd.css";
import CoordsView from "./components/CoordsVIew";
import  CoordsTable, { ICoord } from "./components/CoordsTable";
import ValueForm, { Values } from "./components/ValueForm";
import axios from "axios";
import { saveAs } from 'file-saver';

function App() {
    const [isGeometryLoaded, setIsGeometryLoaded] = useState<boolean>(false);

    const [isLoadingGeometry, setIsLoadingGeometry] = useState<boolean>(false);
    const [geometryLink, setGeometryLink] = useState<string>('http://localhost:8000/api/getGeometry');
    const [clickedPoint, setClickedPoint] = useState<Vector3>();
    const [clickedCoord, setClickedCoord] = useState<ICoord>();
    const [coords, setCoords] = useState<ICoord[]>([]);
    const [selectedCoords, setSelectedCoords] = useState<ICoord[]>([]);

    const [isAddToTable, setIsAddToTable] = useState<boolean>(false);

    const [isWireframe, setIsWireframe] = useState<boolean>(false);

    function generateFile(): void {
        axios.post('http://localhost:8000/api/generateFile', coords)
            .then(() => axios.get('http://localhost:8000/api/getFile', { responseType: 'blob' }))
            .then((res) => {
                const textBlob = new Blob([res.data], { type: 'application/text' });
                saveAs(textBlob, 'result.txt');
            }
        );
    }

    function uploadGeometry(event: any): void {
        setIsLoadingGeometry(true);
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('geometry', file);
        axios.post('http://localhost:8000/api/uploadGeometry', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        }).then((res) => {
            if (res.data === 'false' && res.data === 'error') return;
            setGeometryLink(`http://localhost:8000/api/getGeometry`);
            setIsGeometryLoaded(true);
            setIsLoadingGeometry(false);
        });
    }

    function generateMesh(): void {
        setIsLoadingGeometry(true);
        const fileName = geometryLink.split('/')[geometryLink.split('/').length - 1];
        axios.post('http://localhost:8000/api/generateMesh', {
            fileName: fileName
        })
            .then(() => {
                setTimeout(() => {
                    setGeometryLink('http://localhost:8000/api/getMesh');
                    setIsWireframe(true);
                    setIsLoadingGeometry(false);
                }, 3000);
            });
    }

    function handleValuesChange(values: Values): void {
        const newCoordsList = [...coords];
        const newCoord: ICoord = {
            x: Number(clickedPoint?.x),
            y: Number(clickedPoint?.y),
            z: Number(clickedPoint?.z),
            fx: values.fx,
            fy: values.fy,
            fz: values.fz
        };
        newCoordsList.push(newCoord);
        setCoords(newCoordsList);
        setClickedPoint(undefined);
        setIsAddToTable(!isAddToTable);
    }

    const handleForceChange = (clickedCoordForce: Values) => {
        if (clickedPoint)
            setClickedCoord({
                x: clickedPoint.x,
                y: clickedPoint.y,
                z: clickedPoint.z,
                fx: clickedCoordForce.fx,
                fy: clickedCoordForce.fy,
                fz: clickedCoordForce.fz,
            });
    }

    function getJSXWhenGeometryIsNotLoaded(isLoading: boolean) {
        if (isLoading) {
            return <Spin style={{ marginTop: '100px' }}/>
        }
        return <input onChange={uploadGeometry} name="geometry" style={{ marginTop: '100px' }} type="file"/>;
    }

    return (
        <Layout className='App'>
            <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
                <Typography.Title style={{ color: 'white', margin: 'auto 0' }} level={3}>
                    WebPlatform
                </Typography.Title>
            </Layout.Header>
            <Layout>
                <Layout.Sider
                    breakpoint="xs"
                    width={'350px'}
                    style={{
                        backgroundColor: '#F5F5F5',
                        boxShadow: 'inset -1px 0px 0px #E6E6E6',
                    }}>
                    <Button
                        disabled={!isGeometryLoaded}
                        onClick={() => generateMesh()}
                        type="primary"
                        style={{ marginTop: '20px', width: '80%', height: '50px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Generate Mesh
                    </Button>
                    {/* <CoordsView coords={clickedPoint}/>
                    <ValueForm setClickedCoord={handleForceChange} onClickAddButton={handleValuesChange}/> */}
                </Layout.Sider>
                <Layout.Content>
                    <Layout style={{ height: '100%' }}>
                        <Layout.Content style={{ height: '100%' }}>
                            {isGeometryLoaded
                                ? <Canvas camera={{ position: [0, 50, 50] }}>
                                    <Suspense fallback={null}>
                                        <Model
                                            clickedCoord={clickedCoord}
                                            isAddToTable={isAddToTable}
                                            geometryLink={geometryLink}
                                            coords={coords}
                                            selectedCoords={selectedCoords}
                                            isWireframe={isWireframe}
                                            setClickedPoint={setClickedPoint}/>
                                    </Suspense>
                                    <OrbitControls />
                                </Canvas>
                                : getJSXWhenGeometryIsNotLoaded(isLoadingGeometry)
                            }
                        </Layout.Content>
                        <Layout.Footer 
                            style={{
                                width: '100%',
                                height: '35%',
                                padding: '0',
                                overflowY: 'scroll',
                                backgroundColor: '#F5F5F5',
                                boxShadow: 'inset -1px 0px 0px #E6E6E6'}}>
                                    <div style={{ display: 'flex' }}>
                                        <Typography.Title
                                            style={{ marginLeft: '40px' }}
                                            level={4}>
                                            Select to show in geometry
                                        </Typography.Title>
                                        <Button
                                            style={{ margin: 'auto 40px auto auto' }}
                                            type="primary" onClick={generateFile}>
                                                Export to File
                                        </Button>
                                    </div>
                            <CoordsTable setSelectedCoords={setSelectedCoords} coords={coords}/>
                        </Layout.Footer>
                    </Layout>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}

export default App;
