import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "react-three-fiber";
import { Vector3 } from 'three';
import './App.css';
import Model from './components/Model';
import { Button, Checkbox, Input, Layout, Spin, Typography } from 'antd';
import "antd/dist/antd.css";
import  CoordsTable, { ICoord } from "./components/CoordsTable";
import ValueForm, { Values } from "./components/ValueForm";
import axios from "axios";
import { saveAs } from 'file-saver';
import Displacement, { ILimitation } from "./components/Displacement";

function App() {
    const [isGeometryLoaded, setIsGeometryLoaded] = useState<boolean>(false);

    const [young, setYoung] = useState<string>('');
    const [poisson, setPoisson] = useState<string>('');

    const [pressure, setPressure] = useState<number[][]>();

    const [isLoadingGeometry, setIsLoadingGeometry] = useState<boolean>(false);
    const [geometryLink, setGeometryLink] = useState<string>('http://localhost:8000/api/getGeometry');
    const [clickedPoint, setClickedPoint] = useState<Vector3>();
    const [clickedCoord, setClickedCoord] = useState<ICoord>();
    const [coords, setCoords] = useState<ICoord[]>([]);
    const [selectedCoords, setSelectedCoords] = useState<ICoord[]>([]);

    const [isAddToTable, setIsAddToTable] = useState<boolean>(false);

    const [isWireframe, setIsWireframe] = useState<boolean>(false);
    const [isShowWireframe, setIsShowWireframe] = useState<boolean>(false);

    const [nodes, setNodes] = useState<number[][]>();
    const [clickedNode, setClickedNode] = useState<number>();

    const [limit, setLimit] = useState<ILimitation>();
    const [displaceNodes, setDisplaceNodes] = useState<number[][]>();

    function getFile(): void {
        axios.get('http://localhost:8000/api/calculate').then((res: any) => {
            setPressure(res.data);
        });
        // setPressure([[1,2,2]])
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
            fileName: 'geometry.stl',
            young: young,
            poisson: poisson
        })
            .then(() => {
                setTimeout(() => {
                    setGeometryLink('http://localhost:8000/api/getMesh');
                    axios.get('http://localhost:8000/api/getNodes').then((res: any) => {
                        setNodes(res.data);
                    });
                    setIsWireframe(true);
                    setIsLoadingGeometry(false);
                }, 5000);
            });
    }

    function handleValuesChange(values: Values): void {
        const newCoordsList = [...coords];
        const newCoord: ICoord = {
            x: Number(clickedPoint?.x),
            y: Number(clickedPoint?.y),
            z: Number(clickedPoint?.z),
            node: clickedNode,
            fx: values.fx,
            fy: values.fy,
            fz: values.fz
        };
        let force: string[] = [];
        if (Number(newCoord.fx)) force.push(`F, ${newCoord.node}, FX, ${newCoord.fx}\n`);
        if (Number(newCoord.fy)) force.push(`F, ${newCoord.node}, FY, ${newCoord.fy}\n`);
        if (Number(newCoord.fz)) force.push(`F, ${newCoord.node}, FZ, ${newCoord.fz}`);
        axios.post('http://localhost:8000/api/addCommand', {
            commands: force
        });
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
                node: clickedNode,
                fx: clickedCoordForce.fx,
                fy: clickedCoordForce.fy,
                fz: clickedCoordForce.fz,
            });
    }

    const handleClickAddDisplacement = () => {
        if (displaceNodes) {
            let displacement: string[] = [];
            for (let i = 0; i < displaceNodes.length; i++) {
                displacement.push(`D, ${displaceNodes[i][0]}, ALL, 0\n`);
            }
            axios.post('http://localhost:8000/api/addCommand', {
                commands: displacement
            });
        
        }

    };

    function getJSXWhenGeometryIsNotLoaded(isLoading: boolean) {
        if (isLoading) {
            return <Spin style={{ marginTop: '100px' }}/>
        }
        return <input onChange={uploadGeometry} name="geometry" style={{ marginTop: '100px' }} type="file"/>;
    }

    useEffect(() => {
        isWireframe && setIsShowWireframe(true);
    }, [isWireframe]);

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
                    <div style={{ display: 'flex', width: '80%', margin: '0 auto' }}>
                        <div className="value-form__value">
                            <Typography.Title 
                                style={{ margin: 'auto 5px auto 0' }}
                                level={4}>
                                E(MPa): 
                            </Typography.Title>
                            <Input
                                value={young}
                                onChange={(e) => setYoung(e.target.value)}
                            />
                        </div>
                        <div className="value-form__value">
                            <Typography.Title 
                                style={{ margin: 'auto 5px auto 5px' }}
                                level={4}>
                                μ: 
                            </Typography.Title>
                            <Input
                                value={poisson}
                                onChange={(e) => setPoisson(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        disabled={!(isGeometryLoaded && young && poisson)}
                        onClick={() => generateMesh()}
                        type="primary"
                        style={{ marginTop: '20px', width: '80%', height: '50px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Generate Mesh
                    </Button>
                    {isWireframe && <Checkbox style={{ marginTop: '10px' }} onChange={(e) => setIsShowWireframe(e.target.checked)} defaultChecked={true}>Show Mesh</Checkbox>}
                    {isWireframe && <>
                        <ValueForm setClickedCoord={handleForceChange} onClickAddButton={handleValuesChange}/>
                        <Displacement
                            onChangeLimit={setLimit}
                            onClickAddDisplacement={handleClickAddDisplacement}/>
                    </>}
                </Layout.Sider>
                <Layout.Content>
                    <Layout style={{ height: '100%' }}>
                        <Layout.Content style={{ height: '100%' }}>
                            {isGeometryLoaded
                                ? <Canvas camera={{ position: [0, 50, 50] }}>
                                    <Suspense fallback={null}>
                                        <Model
                                            pressure={pressure}
                                            clickedCoord={clickedCoord}
                                            isAddToTable={isAddToTable}
                                            geometryLink={geometryLink}
                                            coords={coords}
                                            selectedCoords={selectedCoords}
                                            isWireframe={isShowWireframe}
                                            nodes={nodes}
                                            limit={limit}
                                            setClickedPoint={setClickedPoint}
                                            setClickedNode={setClickedNode}
                                            setDisplacementNode={setDisplaceNodes}/>
                                    </Suspense>
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
                                            type="primary" onClick={getFile}>
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
