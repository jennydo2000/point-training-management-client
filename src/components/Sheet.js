import Index from "./template/Index";
import { Button, Input, Modal } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { CopyOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import request from "../utils/request";
import Form from "./template/Form";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
            <Link to={`/points?sheet=${record.id}`}>{text}</Link>
        ),
    },
    {
        title: "Học kỳ",
        dataIndex: "",
        key: "semester",
        render: (text, record) =>
            `Học kỳ ${record.semester?.name} năm học ${record.semester?.year?.name}`,
    },
];

const editForm = [
    {
        label: "Tên",
        name: "name",
    },
    {
        label: "Học kỳ",
        name: "semester_id",
        type: "select",
        options: "semesters",
        disabled: true,
        labelOption: (item) => `Học kỳ ${item.name} năm học ${item.year.name}`,
    },
];

function Department() {
    const [searchParams] = useSearchParams();
    const semesterId = searchParams.get("semester");
    const [semester, setSemester] = useState({ year: {} });

    useEffect(async () => {
        setSemester((await request.get(`/semesters/${semesterId}`)).data);
    }, []);
    const createForm = [
        {
            label: "Tên",
            name: "name",
        },
        {
            label: "Học kỳ",
            name: "semester_id",
            type: "select",
            options: "semesters",
            labelOption: (item) =>
                `Học kỳ ${item.name} năm học ${item.year.name}`,
            initialValue: parseInt(searchParams.get("semester")),
        },
    ];

    const copyForm = [
        {
            label: "Tên",
            name: "name",
        },
        {
            label: "Học kỳ",
            name: "semester_id",
            type: "select",
            options: "semesters",
            labelOption: (item) =>
                `Học kỳ ${item.name} năm học ${item.year.name}`,
            initialValue: parseInt(searchParams.get("semester")),
        },
    ];

    const getParams = () => {
        const params = {};
        if (searchParams.get("semester"))
            params.semester = searchParams.get("semester");
        return params;
    };

    return (
        <>
            <Index
                route="/sheets"
                params={getParams()}
                name="Phiếu điểm"
                routes={[
                    {name: "Quản lý hoạt động", path: "/years"},
                    {name: `Năm học ${semester.year.name}`, path: `/semesters?year=${semester.year.id}`},
                    {name: `Học kỳ ${semester.name}`, path: `/activity_types?semester=${semester.id}`},
                    {name: "Phiếu điểm", path: `/sheets?semester=${semester.id}`},
                ]}
                columns={columns}
                createForm={createForm}
                updateForm={editForm}
                copyForm={copyForm}
            />
        </>
    );
}

export default Department;
