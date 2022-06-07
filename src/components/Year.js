import Index from "./template/Index";
import { Input } from "antd";
import { Link } from "react-router-dom";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
            <Link to={`/semesters?year=${record.id}`}>{text}</Link>
        ),
    },
];

const form = [
    {
        label: "Tên",
        name: "name",
    },
];

function Year() {
    return (
        <Index
            route="/years"
            name="Năm học"
            routes={[
                {name: "Quản lý hoạt động", path: "/years"},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Year;
