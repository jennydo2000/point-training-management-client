import Index from "./template/Index";
import { Input } from "antd";
import { Link } from "react-router-dom";

const columns = [
    {
        title: "Tên khoa",
        dataIndex: "name",
        key: "name",
    },
];

const form = [
    {
        label: "Tên",
        name: "name",
    },
];

function Department() {
    return (
        <Index
            route="/departments"
            name="Khoa"
            routes={[
                {name: "Quản lý khoa", path: "/departments"},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Department;
