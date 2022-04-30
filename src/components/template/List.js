import {Button, Space, Table} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

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
        <Table rowKey="id" dataSource={props.data} columns={columns} />
    );
}

List.defaultProps = {
    columns: [],
    data: [],
    onEdit: () => {},
    onDelete: () => {},
}

export default List;