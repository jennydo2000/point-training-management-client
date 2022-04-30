import Index from "./template/Index";
import {Input} from "antd";
import {Link, useParams, useSearchParams} from "react-router-dom";
import request from "../utils/request";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => <Link to={`/classes?major=${record.id}`}>{text}</Link>
    },
];

function Major() {
    const [searchParams] = useSearchParams();
    const form = [
        {
            label: "Tên",
            name: "name",
        },
        {
            label: "Khoa",
            name: "department_id",
            type: "select",
            options: "departments",
            initialValue: parseInt(searchParams.get("department")),
        },
    ];

    return (
        <Index route="/majors" params={{department: searchParams.get("department")}} name="Ngành học" columns={columns} createForm={form} updateForm={form}/>
    );
}

export default Major;