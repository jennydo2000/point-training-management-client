import Index from "./template/Index";
import {Input} from "antd";
import {Link, useParams, useSearchParams} from "react-router-dom";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => <Link to={`/students?class=${record.id}`}>{text}</Link>
    },
];

function Class() {
    const [searchParams] = useSearchParams();
    const form = [
        {
            label: "Tên",
            name: "name",
        },
        {
            label: "Ngành",
            name: "major_id",
            type: "select",
            options: "majors",
            initialValue: parseInt(searchParams.get("major")),
        },
    ];

    return (
        <Index route="/classes" params={{major: searchParams.get("major")}} name="lớp" columns={columns} createForm={form} updateForm={form}/>
    );
}

export default Class;