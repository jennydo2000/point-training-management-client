import {Button, Space, Table} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import FullHeightTable from "../elemtents/FullHeightTable";

function List(props) {
    const columns = [
        ...props.columns,
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            render: (text, record, index) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined/>} onClick={() => props.onEdit(record, index)}/>
                    <Button type="primary" icon={<DeleteOutlined/>} danger onClick={() => props.onDelete(record, index)}/>
                </Space>
            ),
        },
    ];

    return (
        <FullHeightTable rowKey="id" dataSource={props.data} columns={columns} pagination={false} />
    );
}

List.defaultProps = {
    columns: [],
    data: [],
    onEdit: () => {},
    onDelete: () => {},
}

export default List;