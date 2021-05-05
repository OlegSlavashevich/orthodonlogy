import { Table } from 'antd';
import React, { FunctionComponent } from 'react';
import './style.scss';

interface IPops {
    coords?: ICoord[];
    setSelectedCoords?: (coords: ICoord[]) => void;
}

export interface ICoord {
    x: string | number;
    y: string | number;
    z: string | number;
    fx: string | number;
    fy: string | number;
    fz: string | number;
    node?: number;
}

const CoordsTable: FunctionComponent<IPops> = (props: IPops) => {
    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: ICoord[]) => {
            if (props.setSelectedCoords) props.setSelectedCoords(selectedRows)
        }
    };

    const columns = [
        {
            title: 'Node',
            dataIndex: 'node',
            key: 'node',
        },
        {
          title: 'X',
          dataIndex: 'x',
          key: 'x',
        },
        {
          title: 'Y',
          dataIndex: 'y',
          key: 'y',
        },
        {
          title: 'Z',
          dataIndex: 'z',
          key: 'z',
        },
        {
            title: 'FX',
            dataIndex: 'fx',
            key: 'fx',
        },
        {
            title: 'FY',
            dataIndex: 'fy',
            key: 'fy',
        },
        {
            title: 'FZ',
            dataIndex: 'fz',
            key: 'fz',
        },
    ];

    return (
        <Table
            style={{ width: '100%', height: '100%', maxHeight: '100%' }}
            rowSelection={rowSelection}
            pagination={false}
            columns={columns}
            dataSource={props.coords?.map((coord, index) => ({ key: index, ...coord }))} />
    )
};

export default CoordsTable;