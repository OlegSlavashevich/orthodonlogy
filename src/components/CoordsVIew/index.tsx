import { Input, Typography } from 'antd';
import React, { FunctionComponent } from 'react';
import './style.scss';
import "antd/dist/antd.css";
import { Vector3 } from 'three';

interface IProps {
    coords: Vector3 | undefined;
}

const CoordsView: FunctionComponent<IProps> = (props: IProps) => {
    return (<div className="coords-view">
                <Typography.Title style={{ marginTop: '20px' }}  level={2}>
                    Coords
                </Typography.Title>
                <div className="coords-view__value">
                    <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={4}>
                        X: 
                    </Typography.Title>
                    <Input value={props.coords ? props.coords.x : 0}/>
                </div>
                <div className="coords-view__value">
                    <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={4}>
                        Y: 
                    </Typography.Title>
                    <Input value={props.coords ? props.coords.y : 0}/>
                </div>
                <div className="coords-view__value">
                    <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={4}>
                        Z: 
                    </Typography.Title>
                    <Input value={props.coords ? props.coords.z : 0}/>
                </div>
            </div>);
};

export default CoordsView