import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "react-three-fiber";
import { Vector3 } from 'three';
import { OrbitControls } from "@react-three/drei";
import './App.css';
import Model from './components/Model';
import { Button, Layout, Typography } from 'antd';
import "antd/dist/antd.css";
import CoordsView from "./components/CoordsVIew";
import  CoordsTable, { ICoord } from "./components/CoordsTable";
import ValueForm, { Values } from "./components/ValueForm";
import axios from "axios";
import { saveAs } from 'file-saver';

function App() {
    const [clickedPoint, setClickedPoint] = useState<Vector3>();

    const [coords, setCoords] = useState<ICoord[]>([]);

    useEffect(() => {
        console.log(coords);
    }, [coords]);

    function generateFile() {
        axios.post('http://localhost:8000/api/generate', coords)
            .then(() => axios.get('http://localhost:8000/api/fetch', { responseType: 'blob' }))
            .then((res) => {
                    const textBlob = new Blob([res.data], { type: 'application/text' });
                    saveAs(textBlob, 'result.txt');
            }
        );
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
                    <CoordsView coords={clickedPoint}/>
                    <ValueForm onClickAddButton={handleValuesChange}/>
                </Layout.Sider>
                <Layout.Content>
                    <Layout style={{ height: '100%' }}>
                        <Layout.Content style={{ height: '100%' }}>
                            <Canvas camera={{ position: [0, 50, 50] }}>
                                <Suspense fallback={null}>
                                    <Model coords={coords} setClickedPoint={setClickedPoint}/>
                                </Suspense>
                                <OrbitControls />
                            </Canvas>
                        </Layout.Content>
                        <Layout.Footer 
                            style={{
                                width: '100%',
                                height: '35%',
                                padding: '0',
                                overflowY: 'scroll',
                                backgroundColor: '#F5F5F5',
                                boxShadow: 'inset -1px 0px 0px #E6E6E6'}}>
                                    <div style={{ display: 'flex' }}><Typography.Title style={{ marginLeft: '40px' }} level={4}>Coords And Values table</Typography.Title>
                            <Button style={{ margin: 'auto 40px auto auto' }} type="primary" onClick={generateFile}>Export to File</Button></div>
                            <CoordsTable coords={coords}/>
                        </Layout.Footer>
                    </Layout>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}

export default App;
