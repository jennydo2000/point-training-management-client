import { Button, Space, Table } from "antd";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import FullHeightTable from "../elements/FullHeightTable";
import { useState } from "react";

function List(props) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(1);

    const columns = [
        {
            title: "STT",
            width: 70,
            render: (text, record, index) => {
                index = (page - 1) * pageSize + index;
                return index + 1;
            },
        },
        ...props.columns,
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            render: (text, record, index) => {
                index = (page - 1) * pageSize + index;
                return (
                    <Space>
                        {typeof props.buttons === "function"
                            ? props.buttons(record, index)
                            : props.buttons}
                        {props.canCopy && (
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                onClick={() => props.onCopy(record, index)}
                            ></Button>
                        )}
                        {props.canUpdate && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => props.onUpdate(record, index)}
                            />
                        )}
                        {props.canDelete && (
                            <Button
                                type="primary"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => props.onDelete(record, index)}
                            />
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <FullHeightTable
            rowKey="id"
            dataSource={props.data}
            columns={columns}
            pagination={{
                onChange: (currentPage, currentPageSize) => {
                    setPage(currentPage || page);
                    setPageSize(currentPageSize || pageSize);
                },
            }}
        />
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
};

export default List;
