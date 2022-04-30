import Index from "./template/Index";
import {Input} from "antd";
import {Link} from "react-router-dom";

const columns = [
    {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => <Link to={`/title_activities?sheet=${record.id}`}>{text}</Link>
    },
    {
        title: "Học kỳ",
        dataIndex: "",
        key: "semester",
        render: (text, record) => `Học kỳ ${record.semester.name} năm học ${record.semester.year.name}`,
    },
];

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
        labelOption: (item) => `Học kỳ ${item.name} năm học ${item.year.name}`,
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
    return (
        <Index route="/sheets" name="Phiếu điểm" columns={columns} createForm={createForm} updateForm={editForm}/>
    );
}

export default Department;