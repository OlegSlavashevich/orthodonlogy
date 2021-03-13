import React, { FunctionComponent, useRef, useEffect } from 'react';
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, useThree } from "react-three-fiber";
import { useHelper } from "@react-three/drei";
import './style.scss';

interface IProps {

}

const Model: FunctionComponent<IProps> = (props: IProps) => {
    const geom = useLoader(STLLoader, "book.stl");

    const ref = useRef<any>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (ref.current) camera.lookAt(ref.current.position);
    });

    useHelper(ref, THREE.BoxHelper, "#000");

    return (
        <>
            <mesh ref={ref} onClick={(result) => console.log(result)}>
                <primitive object={geom} attach="geometry" />
                <meshStandardMaterial color={"orange"} />
            </mesh>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
        </>
    );
}

export default Model;