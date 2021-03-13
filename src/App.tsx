import React, { Suspense } from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "@react-three/drei";
import './App.css';
import Model from './components/Model';
    
function App() {
    return (
        <div className="App">
            <Canvas camera={{ position: [0, 100, 100] }}>
                <Suspense fallback={null}>
                    <Model />
                </Suspense>
                <OrbitControls />
            </Canvas>
        </div>
    );
}

export default App;
