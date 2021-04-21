import React, { FunctionComponent, useRef, useEffect, useState } from 'react';
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, useThree } from "react-three-fiber";
import './style.scss';
import { Vector3 } from 'three';
import { ICoord } from '../CoordsTable';

interface IProps {
    geometryLink: string;
    isAddToTable: boolean;
    coords?: ICoord[];
    clickedCoord?: ICoord;
    selectedCoords?: ICoord[];
    setClickedPoint?: (point: Vector3) => void;
}

const Model: FunctionComponent<IProps> = (props: IProps) => {
    const { camera, scene } = useThree();
    const axesHelper = new THREE.AxesHelper( 1000 );
    scene.add(axesHelper);

    const geom: THREE.BufferGeometry = useLoader(STLLoader, props.geometryLink).center();
    geom.name = 'MyCube_s';
    const ref = useRef<any>(null);

    const [pointCoords, setPointCoords] = useState<Vector3>(); 
    const [clickedCoordVect, setClickedCoorVect] = useState<ICoord>();

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

    function handleGeometryClick(event: any): void {
        console.log(event)
        setPointCoords(event.point);
        if (props.setClickedPoint) props.setClickedPoint(event.point);
    }

    return (
        <>
            <mesh position={[-1, 0, 3]} ref={ref}>
                <boxBufferGeometry args={[1, 1, 1]} attach="geometry" />
                <meshPhongMaterial color={'red'} attach="material" />
            </mesh>
            {clickedCoordVect && <mesh position={[Number(clickedCoordVect.x), Number(clickedCoordVect.y), Number(clickedCoordVect.z)]}>
                <arrowHelper args={[new THREE.Vector3(Number(clickedCoordVect.fx),Number(clickedCoordVect.fy),Number(clickedCoordVect.fz)).normalize(),, 15, 'red']} />
            </mesh>}
            <mesh ref={ref} onClick={handleGeometryClick}>
                <primitive object={geom} attach="geometry" />
                <meshNormalMaterial attach="material" />
            </mesh>
            <mesh position={pointCoords} ref={ref}>
                <sphereGeometry attach="geometry" args={[0.4, 16, 16]} />
                <meshStandardMaterial color={"red"} />
            </mesh>
            {props.selectedCoords && props.selectedCoords.map((coord, index) => (
                <mesh key={index} position={new Vector3(Number(coord.x), Number(coord.y), Number(coord.z))} ref={ref}>
                    <arrowHelper args={[new THREE.Vector3(Number(coord.fx),Number(coord.fy),Number(coord.fz)).normalize(),, 15, 'green']} />
                    <meshStandardMaterial color={"green"} />
                </mesh>
            ))}
            <ambientLight />
            <pointLight position={[20, 20, -20]} />
        </>
    );
};

export default Model;
