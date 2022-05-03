import Index from "./template/Index";
import {DatePicker, Input} from "antd";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {excelDateToJSDate} from "../utils/functions";
import moment from "moment";

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
        render: (text) => text && moment(text?.slice(0, -1)).format("DD/MM/YYYY"),
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

const importColumns = [
    {
        title: "MSSV",
        key: "student_code",
        dataIndex: "student_code",
        columnIndex: "B",
    },
    {
        title: "Họ",
        key: "first_name",
        dataIndex: "first_name",
        columnIndex: "C",
    },
    {
        title: "Tên",
        key: "last_name",
        dataIndex: "last_name",
        columnIndex: "D",
    },
    {
        title: "Giới tính",
        key: "gender",
        dataIndex: "gender",
        columnIndex: "E",
        convert: (text) => {
            if (text === "Nam") return "male";
            else if (text === "Nữ") return "female";
            else return "text";
        }
    },
    {
        title: "Ngày sinh",
        key: "dob",
        dataIndex: "dob",
        columnIndex: "F",
        convert: (text) => excelDateToJSDate(text),
    },
    {
        title: "Lớp",
        key: "class_id",
        dataIndex: "class_id",
        columnIndex: "G",
        convert: "classes",
    },
    {
        title: "Tên tài khoản",
        key: "username",
        dataIndex: "username",
        columnIndex: "H",
    },
    {
        title: "Mật khẩu",
        key: "password",
        dataIndex: "password",
        columnIndex: "I",
    },
    {
        title: "Email",
        key: "email",
        dataIndex: "email",
        columnIndex: "J",
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
            dataIndex: ["user", "first_name"],
        },
        {
            label: "Tên",
            name: "last_name",
            dataIndex: ["user", "last_name"],
        },
        {
            label: "Giới tính",
            name: "gender",
            type: "select",
            options: [
                {id: "male", name: "Nam"},
                {id: "female", name: "Nữ"},
            ],
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
            dataIndex: ["user", "username"],
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
            dataIndex: ["user", "email"],
        },
    ];

    return (
        <Index
            route="/students"
            params={{class: searchParams.get("class")}}
            name="Sinh viên"
            columns={columns}
            importColumns={importColumns}
            createForm={form}
            updateForm={form}
        />
    );
}

export default Class;