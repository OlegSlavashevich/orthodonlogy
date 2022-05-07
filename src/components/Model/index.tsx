import React, { FunctionComponent, useRef, useEffect, useState } from 'react';
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, useThree } from "react-three-fiber";
import './style.scss';
import { Float32BufferAttribute, Vector3, DoubleSide } from 'three';
import { ICoord } from '../CoordsTable';
import { OrbitControls } from '@react-three/drei';
import { ILimitation } from '../Displacement';
import { Lut } from "three/examples/jsm/math/Lut";
import press from '../../data/pressure.json';
import { useControls } from "leva";
import { attachTypeApi } from 'antd/lib/message';

interface IProps {
    geometryLink: string;
    isAddToTable: boolean;
    coords?: ICoord[];
    clickedCoord?: ICoord;
    selectedCoords?: ICoord[];
    isWireframe?: boolean;
    nodes?: number[][];
    limit?: ILimitation;
    pressure: number[][] | undefined;
    setClickedPoint?: (point: Vector3) => void;
    setClickedNode?: (node: number) => void;
    setDisplacementNode?: (node: number[][]) => void;
}

const Model: FunctionComponent<IProps> = (props: IProps) => {
    const { camera, scene } = useThree();
    const axesHelper = new THREE.AxesHelper( 1000 );
    scene.add(axesHelper);

    // const { colorMap, min, max } = useControls({
    //     colorMap: {
    //       value: "rainbow",
    //       options: ["rainbow", "cooltowarm", "blackbody", "grayscale"]
    //     },
    //     min: Math.min(...press),
    //     max: Math.max(...press)
    // });

    const geom: THREE.BufferGeometry = useLoader(STLLoader, props?.geometryLink);
    geom.name = 'MyCube_s';
    const ref = useRef<any>(null);

    THREE.Object3D.DefaultUp.set(0, 0, 1);
    const [pointCoords, setPointCoords] = useState<Vector3>(); 
    const [clickedCoordVect, setClickedCoorVect] = useState<ICoord>();

    const [displacementNodes, setDisplacementNodes] = useState<number[][]>();

    useEffect(() => {
        if (props.limit && props.nodes) {
            findIntersectionWithGeometry(props.limit, props.nodes);
        }
    }, [props.limit]);

    const findIntersectionWithGeometry = (limit: ILimitation, nodes: number[][]) => {
        let tmpNodes = [...nodes];
        let sortedNodes = tmpNodes.filter((node) => {
            return (
                Number(limit.xmin) <= node[1] && node[1] <= Number(limit.xmax)
                && Number(limit.ymin) <= node[2] && node[2] <= Number(limit.ymax)
                && Number(limit.zmin) <= node[3] && node[3] <= Number(limit.zmax)
            );
        });
        setDisplacementNodes(sortedNodes);
        if (props.setDisplacementNode) props.setDisplacementNode(sortedNodes);
    };

    camera.up.set(0,0,1);

    useEffect(() => {
        if (props?.coords?.length) {
            setPointCoords(new THREE.Vector3( 1, 0, 0 ));
        }
    }, [props.isAddToTable]);

    useEffect(() => {
        if (props.pressure && props?.geometryLink) {
            // createPressureArray()

            const pressure: number[] = createPressureArray(props.pressure);

            const lut = new Lut();
            lut.setColorMap("rainbow");
            lut.setMin(Math.min(...pressure));
            lut.setMax(Math.max(...pressure));
            const defaultColor = [];

            geom.setAttribute("pressure", new Float32BufferAttribute(pressure, 1))

            const test = [];

            for (let i = 0; i < geom.attributes.position.array.length / 3; i++) {
                test.push(geom.attributes.position.array[3 * i])
            }

            console.log(test);

            for (let i = 0, n = geom.attributes.position.array.length / 3; i < n; ++i) {
                defaultColor.push(Math.random(), Math.random(), Math.random());
            }
            geom.setAttribute("color", new Float32BufferAttribute(defaultColor, 3));

            const pressures = geom.attributes.pressure;
            const colors = geom.attributes.color;
        
            for (let i = 0; i < pressures.array.length; i++) {
                const pressure = pressures.array[i];
        
                const color = lut.getColor(pressure);
        
                if (color === undefined) {
                console.log("Unable to determine color for value:", pressure);
                } else {
                colors.setXYZ(i, color.r, color.g, color.b);
                }
            }
            console.log(geom);
        }
    }, [props.pressure]);

    const createPressureArray = (result: number[][]) => {
        const pressure = [];
        const distan = [];
        const positions = geom.attributes.position.array
        for (let i = 0; i < positions.length; i++) {
            const [dist, index] = getMinDistance(positions[3 * i], positions[3 * i + 1], positions[3 * i + 2], result);
            pressure.push(result[index][0]);
            distan.push(dist);
        }
        console.log(pressure);
        return pressure;
    };

    useEffect(() => {
        setClickedCoorVect(undefined);
    }, [pointCoords]);

    useEffect(() => {
        if (props.clickedCoord) {
            setClickedCoorVect(props.clickedCoord);
        }
    }, [props.clickedCoord]);


    useEffect(() => {
        if (ref.current) camera.lookAt(ref.current.position);
    });

    function getDist(x1: number, y1: number, z1: number, 
        x2: number, y2: number, z2: number): number {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
    }

    function getMinDistance(x1: number, y1: number, z1: number, nodes: number[][]): [number, number] {
        let tmpNodes = [...nodes];
        let min = getDist(x1, y1, z1, tmpNodes[0][1], tmpNodes[0][2], tmpNodes[0][3]);
        let minIndex = 0;
        for (let i = 1; i < tmpNodes.length; ++i) {
            let localDist = getDist(x1, y1, z1, tmpNodes[i][1], tmpNodes[i][2], tmpNodes[i][3]);
            if (localDist < min) {
                min = localDist;
                minIndex = i;
            }
        }
        return [min, minIndex];
    }

    function handleGeometryClick(event: any): void {
        if (props.nodes?.length) {
            const [nodeLen, nodeIndex] = getMinDistance(
                event.point.x, event.point.y, event.point.z,
                props.nodes
            );
            const node = new THREE.Vector3(
                props.nodes[nodeIndex][1],
                props.nodes[nodeIndex][2],
                props.nodes[nodeIndex][3]
            );
            setPointCoords(node);
            if (props.setClickedNode) props.setClickedNode(props.nodes[nodeIndex][0]);
            if (props.setClickedPoint) props.setClickedPoint(node);
        }
    }

    return (
        <>
            {!props.pressure && <mesh ref={ref} onClick={handleGeometryClick}>
                <primitive object={geom} attach="geometry" />
                {(props.isWireframe && !props.pressure) 
                    && <meshBasicMaterial color="#808080" wireframe={true}/>
                }
                {(!props.isWireframe && !props.pressure) && <meshNormalMaterial color="#1E90FF" />}
            </mesh>}
            {props.pressure && <mesh geometry={geom}>
                <meshStandardMaterial side={DoubleSide} color={0xf5f5f5} vertexColors/>
            </mesh>}
            {props.limit && 
                <mesh position={[
                    (Number(props.limit.xmin) + Number(props.limit.xmax)) / 2, 
                    (Number(props.limit.ymin) + Number(props.limit.ymax)) / 2,
                    (Number(props.limit.zmin) + Number(props.limit.zmax)) / 2
                ]}>
                    <boxBufferGeometry args={[
                        Math.abs(Number(props.limit.xmin) - Number(props.limit.xmax)),
                        Math.abs(Number(props.limit.ymin) - Number(props.limit.ymax)),
                        Math.abs(Number(props.limit.zmin) - Number(props.limit.zmax))]} attach="geometry"/>
                    <meshStandardMaterial transparent={true} color={'#D3D3D3'} attach="material" opacity={0.5}/>
                </mesh>
            }
            {clickedCoordVect && <mesh position={[Number(clickedCoordVect.x), Number(clickedCoordVect.y), Number(clickedCoordVect.z)]}>
                <arrowHelper args={[new THREE.Vector3(Number(clickedCoordVect.fx),Number(clickedCoordVect.fy),Number(clickedCoordVect.fz)).normalize(),, 15, 'red']} />
            </mesh>}
            <mesh position={pointCoords}>
                <sphereGeometry attach="geometry" args={[0.4, 16, 16]} />
                <meshStandardMaterial color={"red"} />
            </mesh>
            {displacementNodes && displacementNodes.map((node) => (
                <mesh position={new THREE.Vector3(node[1], node[2], node[3])}>
                    <sphereGeometry attach="geometry" args={[0.4, 16, 16]} />
                    <meshStandardMaterial color={"green"} />
                </mesh>
            ))}
            {props.selectedCoords && props.selectedCoords.map((coord, index) => (
                <mesh key={index} position={new Vector3(Number(coord.x), Number(coord.y), Number(coord.z))}>
                    <arrowHelper args={[new THREE.Vector3(Number(coord.fx),Number(coord.fy),Number(coord.fz)).normalize(),, 15, 'red']} />
                    <meshStandardMaterial color={"green"} />
                </mesh>
            ))}
            <ambientLight intensity={0.25} />
            <pointLight position={[100, 0, 0]} />
            <pointLight position={[0, 100, 100]} />
            <pointLight position={[0, 0, 0]} />
            <OrbitControls />
        </>
    );
};

export default Model;
