import { Typography, Input, Button } from 'antd';
import React, { FunctionComponent, useState } from 'react';
import './style.scss';
import "antd/dist/antd.css";

interface IProps {
    onClickAddButton?: (values: Values) => void;
}

export interface Values {
    fx: string;
    fy: string;
    fz: string;
}

const defaultValue = { fx: '0', fy: '0', fz: '0' };

const ValueForm: FunctionComponent<IProps> = (props: IProps)  => {
    const [values, setValues] = useState<Values>(defaultValue);

    function onChangeValuesInput(value: string, type: 'fx' | 'fy' | 'fz'): void {
        const newValues = Object.assign({}, values);
        newValues[type] = value;
        setValues(newValues);
    }

    function handleClick() {
        setValues(defaultValue);
        if (props.onClickAddButton) props.onClickAddButton(values);
    }

    return (<div className="value-form">
                <Typography.Title style={{ marginTop: '20px' }}  level={2}>
                    Force
                </Typography.Title>
                <div className="value-form__value">
                    <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={4}>
                        X: 
                    </Typography.Title>
                    <Input
                        value={values.fx}
                        onChange={(event) => onChangeValuesInput(event.target.value, 'fx')}/>
                </div>
                <div className="value-form__value">
                    <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={4}>
                        Y: 
                    </Typography.Title>
                    <Input
                        value={values.fy}
                        onChange={(event) => onChangeValuesInput(event.target.value, 'fy')}/>
                </div>
                <div className="value-form__value">
                    <Typography.Title 
                        style={{ margin: 'auto 5px auto 0' }}
                        level={4}>
                        Z: 
                    </Typography.Title>
                    <Input
                        value={values.fz}
                        onChange={(event) => onChangeValuesInput(event.target.value, 'fz')}/>
                </div>
                <Button
                    onClick={() => handleClick()}
                    type="primary"
                    style={{ marginTop: '60px', width: '80%', height: '50px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Add to table
                </Button>
            </div>);
};

export default ValueForm;