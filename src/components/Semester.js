import Index from "./template/Index";
import {Link, useSearchParams} from "react-router-dom";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => <Link to={`/activity_types?semester=${record.id}`}>Học kỳ {text}</Link>
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
            label: "Năm học",
            name: "year_id",
            type: "select",
            options: "years",
            initialValue: parseInt(searchParams.get("year")),
        },
    ];

    return (
        <Index route="/semesters" params={{year: searchParams.get("year")}} name="Học kỳ" columns={columns} createForm={form} updateForm={form}/>
    );
}

export default Major;