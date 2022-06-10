import Index from "./template/Index";
import { Input } from "antd";
import { Link, useParams, useSearchParams } from "react-router-dom";
import request from "../utils/request";
import { useEffect, useState } from "react";

const columns = [
    {
        title: "Tên ngành học",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Khoa",
        dataIndex: ["department", "name"],
        key: "department_name",
    },
];

function Major() {
    const [searchParams] = useSearchParams();
    const departmentId = searchParams.get("department");
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
                {name: "Quản lý ngành học", path: "/majors"},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Major;
