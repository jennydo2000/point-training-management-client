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
                Học kỳ {text}
            </Link>
        ),
    },
];

function Major() {
    const [searchParams] = useSearchParams();
    const yearId = searchParams.get("year");

    const [year, setYear] = useState({});

    useEffect(async () => {
        setYear((await request.get(`/years/${yearId}`)).data);
    }, []);

    const form = [
        {
            label: "Tên",
            name: "name",
        },
        {
            label: "Năm học",
            name: "year_id",
            type: "select",
            options: "years",
            initialValue: parseInt(yearId),
        },
    ];

    return (
        <Index
            route="/semesters"
            params={{ year: yearId }}
            name="Học kỳ"
            routes={[
                {name: "Quản lý hoạt động", path: "/years"},
                {name: `Năm học ${year.name}`, path: `/semester?year=${yearId}`},
            ]}
            columns={columns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Major;
