import Index from "./template/Index";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import request from "../utils/request";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
            <Link to={`/activity_types?semester=${record.id}`}>
                Học kỳ {text} năm học {record.year.name}
            </Link>
        ),
    },
];

function Major() {
    const [searchParams] = useSearchParams();
    const yearId = searchParams.get("year");

    const form = [
        {
            label: "Năm học",
            name: "year_id",
            type: "select",
            options: "years",
        },
        {
            label: "Học kỳ",
            name: "name",
            type: "select",
            options: [
                {id: "1", name: "Học kỳ 1"},
                {id: "2", name: "Học kỳ 2"},
            ],
            initialValue: "1",
        },
    ];

    const copyForm = [
        {
            label: "Năm học",
            name: "year_id",
            type: "select",
            options: "years",
            initialValue: parseInt(yearId),
        },
        {
            label: "Học kỳ",
            name: "name",
            type: "select",
            options: [
                {id: "1", name: "Học kỳ 1"},
                {id: "2", name: "Học kỳ 2"},
            ],
            initialValue: "1",
        },
    ];

    return (
        <Index
            route="/semesters"
            params={{ year: yearId }}
            name="Học kỳ"
            routes={[
                {name: "Quản lý hoạt động", path: "/years"},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
            copyForm={copyForm}
        />
    );
}

export default Major;
