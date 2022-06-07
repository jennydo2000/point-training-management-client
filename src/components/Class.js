import Index from "./template/Index";
import { Input } from "antd";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import request from "../utils/request";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
            <Link to={`/students?class=${record.id}`}>{text}</Link>
        ),
    },
];

function Class() {
    const [searchParams] = useSearchParams();
    const majorId = searchParams.get("major");
    const [major, setMajor] = useState({department: {}});

    useEffect(async () => {
        setMajor((await request.get(`/majors/${majorId}`)).data);
    }, []);

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
        <Index
            route="/classes"
            params={{ major: majorId }}
            name="lớp"
            routes={[
                {name: "Quản lý sinh viên", path: "/departments"},
                {name: `Khoa ${major.department.name}`, path: `/majors?department=${major.department.id}`},
                {name: `Ngành ${major.name}`, path: `/classes?major=${major.id}`},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Class;
