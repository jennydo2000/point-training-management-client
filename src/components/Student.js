import Index from "./template/Index";
import {DatePicker, Input} from "antd";
import {Link, useParams, useSearchParams} from "react-router-dom";

const columns = [
    {
        title: "MSSV",
        dataIndex: "student_code",
        key: "student_code",
    },
    {
        title: "Họ",
        dataIndex: ["user", "first_name"],
        key: "first_name",
    },
    {
        title: "Tên",
        dataIndex: ["user", "last_name"],
        key: "last_name",
    },
    {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        render: (text) => text === "male" ? "Nam" : "Nữ",
    },
    {
        title: "Ngày sinh",
        dataIndex: "dob",
        key: "dob",
    },
    {
        title: "Tên tài khoản",
        dataIndex: ["user", "username"],
        key: "username",
    },
    {
        title: "Email",
        dataIndex: ["user", "email"],
        key: "email",
    },
];

function Class() {
    const [searchParams] = useSearchParams();
    const form = [
        {
            label: "MSSV",
            name: "student_code",
        },
        {
            label: "Họ",
            name: "first_name",
        },
        {
            label: "Tên",
            name: "last_name",
        },
        {
            label: "Giới tính",
            name: "gender",
            type: "select",
            options: "genders",
            initialValue: "male",
        },
        {
            label: "Ngày sinh",
            name: "dob",
            type: "date",
        },
        {
            label: "Lớp",
            name: "class_id",
            type: "select",
            options: "classes",
            initialValue: parseInt(searchParams.get("class")),
        },
        {
            label: "Tên tài khoản",
            name: "username",
        },
        {
            label: "Mật khẩu",
            name: "password",
            component: <Input.Password/>
        },
        {
            label: "Nhập lại mật khẩu",
            name: "repass",
            component: <Input.Password/>
        },
        {
            label: "Email",
            name: "email",
        },
    ];

    return (
        <Index route="/students" params={{class: searchParams.get("class")}} name="Sinh viên" columns={columns} createForm={form} updateForm={form}/>
    );
}

export default Class;