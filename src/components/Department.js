import Index from "./template/Index";
import {Input} from "antd";
import {Link} from "react-router-dom";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => <Link to={`/majors?department=${record.id}`}>{text}</Link>
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
        <Index route="/departments" name="Khoa" columns={columns} createForm={form} updateForm={form}/>
    );
}

export default Department;