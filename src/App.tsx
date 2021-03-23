import React, { Suspense, useState } from "react";
import { Canvas } from "react-three-fiber";
import { Vector3 } from 'three';
import { OrbitControls } from "@react-three/drei";
import './App.css';
import Model from './components/Model';
import { Layout, Typography } from 'antd';
import "antd/dist/antd.css";
import CoordsView from "./components/CoordsVIew";

function App() {
    const [clickedPoint, setClickedPoint] = useState<Vector3>();

    return (
        <Layout className='App'>
            <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
                <Typography.Title style={{ color: 'white', margin: 'auto 0' }} level={3}>
                    WebPlatform
                </Typography.Title>
            </Layout.Header>
            <Layout>
                <Layout.Sider
                    width='300px' 
                    style={{ backgroundColor: '#F5F5F5', boxShadow: 'inset -1px 0px 0px #E6E6E6'}}>
                    <CoordsView coords={clickedPoint}/>
                </Layout.Sider>
                <Layout.Content>
                    <Layout style={{ height: '100%' }}>
                        <Layout.Content style={{ height: '100%' }}>
                            <Canvas camera={{ position: [0, 50, 50] }}>
                                <Suspense fallback={null}>
                                    <Model setClickedPoint={setClickedPoint}/>
                                </Suspense>
                                <OrbitControls />
                            </Canvas>
                        </Layout.Content>
                    </Layout>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}

export default App;
