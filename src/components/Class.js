import Index from "./template/Index";
import { Input } from "antd";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import request from "../utils/request";

const columns = [
    {
        title: "Tên lớp học",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Ngành học",
        dataIndex: ["major", "name"],
        key: "major_name",
    },
];

function Class() {
    const [searchParams] = useSearchParams();
    const majorId = searchParams.get("major");

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
                {name: "Quản lý lớp học", path: "/classes"},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Class;
