import React, { FunctionComponent, useRef, useEffect, useState } from 'react';
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, useThree } from "react-three-fiber";
import './style.scss';
import { Vector3 } from 'three';
import { ICoord } from '../CoordsTable';
import { OrbitControls } from '@react-three/drei';
import { ILimitation } from '../Displacement';

interface IProps {
    geometryLink: string;
    isAddToTable: boolean;
    coords?: ICoord[];
    clickedCoord?: ICoord;
    selectedCoords?: ICoord[];
    isWireframe?: boolean;
    nodes?: number[][];
    limit?: ILimitation;
    setClickedPoint?: (point: Vector3) => void;
    setClickedNode?: (node: number) => void;
    setDisplacementNode?: (node: number[][]) => void;
}

const Model: FunctionComponent<IProps> = (props: IProps) => {
    const { camera, scene } = useThree();
    const axesHelper = new THREE.AxesHelper( 1000 );
    scene.add(axesHelper);

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
            <mesh ref={ref} onClick={handleGeometryClick}>
                <primitive object={geom} attach="geometry" />
                {props.isWireframe 
                    && <meshBasicMaterial color="#808080" wireframe={true}/>
                }
                {!props.isWireframe && <meshNormalMaterial color="#1E90FF" />}
                
            </mesh>
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
            <ambientLight />
            <pointLight position={[20, 20, 20]} />
            <OrbitControls />
        </>
    );
};

export default Model;
