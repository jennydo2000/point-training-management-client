import {Button, Space, Table} from "antd";
import {CopyOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import FullHeightTable from "../elements/FullHeightTable";

function List(props) {
    const columns = [
        ...props.columns,
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            render: (text, record, index) => (
                <Space>
                    {typeof props.buttons === "function" ? props.buttons(record, index) : props.buttons}
                    {props.canCopy && <Button type="primary" icon={<CopyOutlined/>} onClick={() => props.onCopy(record, index)}></Button>}
                    {props.canUpdate && <Button type="primary" icon={<EditOutlined/>} onClick={() => props.onUpdate(record, index)}/>}
                    {props.canDelete && <Button type="primary" icon={<DeleteOutlined/>} danger onClick={() => props.onDelete(record, index)}/>}
                </Space>
            ),
        },
    ];

    return (
        <FullHeightTable rowKey="id" dataSource={props.data} columns={columns} pagination={false} />
    );
}

List.defaultProps = {
    buttons: [],
    columns: [],
    data: [],
    onUpdate: () => {},
    onDelete: () => {},
    onCopy: () => {},
    canCopy: false,
    canEdit: false,
    canCreate: false,
}

export default List;