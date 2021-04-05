import React, { FunctionComponent, useRef, useEffect, useState } from 'react';
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, useThree } from "react-three-fiber";
import './style.scss';
import { Vector3 } from 'three';
import { ICoord } from '../CoordsTable';

interface IProps {
    geometryLink: string;
    coords?: ICoord[];
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

    const [selectedCoords, setSelectedCoords] = useState<Vector3[]>();

    useEffect(() => {
        if (props?.coords?.length) {
            setPointCoords(new THREE.Vector3( 1, 0, 0 ));
        }
    }, [props.coords]);

    useEffect(() => {
        if (props.selectedCoords?.length) {
            setSelectedCoords(props.selectedCoords.map((coord: ICoord) => {
                return new Vector3(Number(coord.x), Number(coord.y), Number(coord.z));
            }));
        } else {
            setSelectedCoords([new THREE.Vector3( 1, 0, 0 )]);
        }
    }, [props.selectedCoords]);

    useEffect(() => {
        if (ref.current) camera.lookAt(ref.current.position);
    });

    function handleGeometryClick(event: any): void {
        setPointCoords(event.point);
        if (props.setClickedPoint) props.setClickedPoint(event.point);
    }

    return (
        <>
            <mesh ref={ref} onClick={handleGeometryClick}>
                <primitive object={geom} attach="geometry" />
                <meshStandardMaterial color={"#FFD700"} />
            </mesh>
            <mesh position={pointCoords} ref={ref}>
                <sphereGeometry attach="geometry" args={[0.4, 16, 16]} />
                <meshStandardMaterial color={"red"} />
            </mesh>
            {selectedCoords && selectedCoords.map((coord, index) => (
                <mesh key={index} position={coord} ref={ref}>
                    <sphereGeometry attach="geometry" args={[0.4, 16, 16]} />
                    <meshStandardMaterial color={"green"} />
                </mesh>
            ))}
            <ambientLight />
            <pointLight position={[20, 20, -20]} />
        </>
    );
};

export default Model;
