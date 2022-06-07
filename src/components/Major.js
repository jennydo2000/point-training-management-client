import Index from "./template/Index";
import { Input } from "antd";
import { Link, useParams, useSearchParams } from "react-router-dom";
import request from "../utils/request";
import { useEffect, useState } from "react";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
            <Link to={`/classes?major=${record.id}`}>{text}</Link>
        ),
    },
];

function Major() {
    const [searchParams] = useSearchParams();
    const departmentId = searchParams.get("department");
    const [department, setDepartment] = useState({});

    useEffect(async () => {
        setDepartment((await request.get(`/departments/${departmentId}`)).data);
    }, []);

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
        <Index
            route="/majors"
            params={{ department: departmentId }}
            name="Ngành học"
            routes={[
                {name: "Quản lý sinh viên", path: "/departments"},
                {name: `Khoa ${department.name}`, path: `/majors?department=${department.id}`},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Major;
