import { Button, Input, Typography } from 'antd';
import React, { FunctionComponent, useState } from 'react';

export interface ILimitation {
    xmin: number | string;
    xmax: number | string;
    ymin: number | string;
    ymax: number | string;
    zmin: number | string;
    zmax: number | string;
}

interface IProps {
    onChangeLimit?: (limit: ILimitation) => void;
    onClickAddDisplacement?: () => void;
}

const defaultLimit: ILimitation = {
    xmin: '',
    xmax: '',
    ymin: '',
    ymax: '',
    zmin: '',
    zmax: '',
}

const Displacement: FunctionComponent<IProps> = (props: IProps) => {
    const [limit, setLimit] = useState<ILimitation>(defaultLimit);

    const updateLimit = (
        value: string,
        key: 'xmin' | 'xmax' | 'ymin' | 'ymax' | 'zmin' | 'zmax'
    ) => {
        let tmpLimit = Object.assign({}, limit);
        tmpLimit[key] = value;
        setLimit(tmpLimit);
        if (props.onChangeLimit) props.onChangeLimit(tmpLimit);
    };

    return (
        <div className="displacement">
            <Typography.Title style={{ marginTop: '10px' }} level={4}>
                Displacement
            </Typography.Title>
            <div style={{ display: 'flex', margin: '5px 40px' }}>
                <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={5}>
                        Xmin: 
                </Typography.Title>
                <Input
                    style={{ marginRight: '5px' }}
                    value={limit?.xmin}
                    onChange={(e) => updateLimit(e.target.value, 'xmin')}/>
                <Typography.Title 
                        style={{ margin: 'auto 5px auto 5px' }}
                        level={5}>
                        Xmax: 
                </Typography.Title>
                <Input
                    value={limit?.xmax}
                    onChange={(e) => updateLimit(e.target.value, 'xmax')}/>
            </div>
            <div style={{ display: 'flex', margin: '10px 40px' }}>
                <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={5}>
                        Ymin: 
                </Typography.Title>
                <Input 
                    style={{ marginRight: '5px' }}
                    value={limit?.ymin}
                    onChange={(e) => updateLimit(e.target.value, 'ymin')}/>
                <Typography.Title 
                        style={{ margin: 'auto 5px auto 5px' }}
                        level={5}>
                        Ymax: 
                </Typography.Title>
                <Input
                    value={limit?.ymax}
                    onChange={(e) => updateLimit(e.target.value, 'ymax')}/>
            </div>
            <div style={{ display: 'flex', margin: '5px 40px' }}>
                <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={5}>
                        Zmin: 
                </Typography.Title>
                <Input 
                    style={{ marginRight: '5px' }}
                    value={limit?.zmin}
                    onChange={(e) => updateLimit(e.target.value, 'zmin')}/>
                <Typography.Title 
                        style={{ margin: 'auto 5px auto 5px' }}
                        level={5}>
                        Zmax: 
                </Typography.Title>
                <Input
                    value={limit?.zmax}
                    onChange={(e) => updateLimit(e.target.value, 'zmax')}/>
            </div>
            <Button
                type="primary"
                onClick={props.onClickAddDisplacement}
                style={{ marginTop: '10px', width: '80%', height: '50px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Add Displacement
            </Button>
        </div>
    );
};
export default Displacement;