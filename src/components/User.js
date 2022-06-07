import Index from "./template/Index";
import { Input } from "antd";

const columns = [
    {
        title: "Ảnh đại diện",
        dataIndex: "avatar",
        key: "avatar",
    },
    {
        title: "Tên tài khoản",
        dataIndex: "username",
        key: "username",
    },
    {
        title: "Họ và tên",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
            <>
                {record.first_name} {record.last_name}
            </>
        ),
    },
    {
        title: "Loại tài khoản",
        dataIndex: ["user_type", "name"],
        key: "user_type",
    },
];

const createForm = [
    {
        label: "Loại tài khoản",
        name: "user_type_id",
        type: "select",
        options: [
            { id: 1, name: "Người quản trị" },
            { id: 2, name: "Người nhập liệu" },
        ],
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
        label: "Tên tài khoản",
        name: "username",
    },
    {
        label: "Email",
        name: "email",
    },
    {
        label: "Mật khẩu",
        name: "password",
        component: <Input.Password />,
        error: (values) =>
            values.password !== values.repass &&
            values.repass &&
            "Không khớp nhập lại với mật khẩu",
    },
    {
        label: "Nhập lại mật khẩu",
        name: "repass",
        component: <Input.Password />,
        error: (values) =>
            values.password !== values.repass &&
            values.repass &&
            "Không khớp với mật khẩu",
    },
];

const updateForm = [
    {
        label: "Loại tài khoản",
        name: "user_type_id",
        disabled: true,
        type: "select",
        options: [
            { id: 1, name: "Người quản trị" },
            { id: 2, name: "Người nhập liệu" },
        ],
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
        label: "Tên tài khoản",
        name: "username",
    },
    {
        label: "Email",
        name: "email",
    },
    {
        label: "Mật khẩu",
        name: "password",
        component: <Input.Password />,
        error: (values) =>
            values.password !== values.repass &&
            values.repass &&
            "Không khớp nhập lại với mật khẩu",
    },
    {
        label: "Nhập lại mật khẩu",
        name: "repass",
        component: <Input.Password />,
        error: (values) =>
            values.password !== values.repass &&
            values.repass &&
            "Không khớp với mật khẩu",
    },
];

function User() {
    return (
        <Index
            route="/users"
            name="Tài khoản"
            routes={[
                {name: "Quản lý tài khoản", path: "/users"},
            ]}
            columns={columns}
            createForm={createForm}
            updateForm={updateForm}
        />
    );
}

export default User;
