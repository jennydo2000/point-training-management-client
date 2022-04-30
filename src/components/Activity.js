import Index from "./template/Index";
import {Button, DatePicker, Input} from "antd";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import request from "../utils/request";
import moment from "moment";

const columns = [
    {
        title: "Loại hoạt động",
        dataIndex: ["activity_type", "name"],
        key: "activity_type",
    },
    {
        title: "Mã hoạt động",
        dataIndex: "code",
        key: "code",
    },
    {
        title: "Tên hoạt động",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Thời gian",
        dataIndex: "time_start",
        key: "time_start",
        render: (text, record) => {
            const time_start = record.time_start !== null ? moment(record.time_start?.slice(0, -1)).format("DD/MM/YYYY") : null;
            const time_end = record.time_end !== null ? moment(record.time_end?.slice(0, -1)).format("DD/MM/YYYY") : null;
            if (time_start && time_end) return <>Từ {time_start} đến {time_end}</>
            else if (!time_start && !time_end) return <>Cả năm</>
            else if (time_end) return <> Đến hết ngày {time_end}</>
            else if (time_start) return <> Bắt đầu từ ngày {time_start}</>
        }
    },
    {
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
    },
    {
        title: "Đơn vị tổ chức",
        dataIndex: "host",
        key: "host",
    },
    {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
    },
];

const pre = (values) => {
    values.accepts = Array.isArray(values.accepts) ? values.array : values.accepts ? values.accepts.replaceAll(", ", ",").split(",") : null;
    values.default_value = values.default_value || 0;
    return values;
}

function Activity() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const form = [
        {
            label: "Học kỳ",
            name: "semester_id",
            type: "hidden",
            initialValue: parseInt(searchParams.get("semester")) || null,
            hide: () => searchParams.get("semester") === null,
        },
        {
            label: "Loại hoạt động",
            name: "activity_type_id",
            type: "select",
            options: "activity_types",
            initialValue: 1,
        },
        {
            label: "Mã hoạt động",
            name: "code",
        },
        {
            label: "Tên hoạt động",
            name: "name",
        },
        {
            label: "Ngày bắt đầu",
            name: "time_start",
            type: "date",
        },
        {
            label: "Ngày kết thúc",
            name: "time_end",
            type: "date",
        },
        {
            label: "Địa điểm",
            name: "host",
        },
        {
            label: "Kiểu hoạt động",
            name: "type",
            type: "select",
            options: [
                {id: "CHECK", name: "Đánh dấu"},
                {id: "COUNT", name: "Đếm số lần"},
                {id: "ENUM", name: "Lựa chọn"},
            ],
            initialValue: "CHECK",
        },
        {
            label: "Các lựa chọn",
            name: "accepts",
            hide: (values) => {
                return values?.type !== "ENUM"
            },
        },
        {
            label: "Mặc định",
            name: "default_value",
            type: "number",
            initialValue: 0,
            hide: (values) => {
                return values?.type === "ENUM"
            },
        },
        {
            label: "Mặc định",
            name: "default_value",
            type: "select",
            options: (values) => {
                console.log(values);
                if (values?.type === "ENUM")
                    if (typeof values?.accepts === "string") return values?.accepts?.split(",").map((accept, index) => ({id: index, name: accept.trim()}));
                    else return values.accepts.map((accept, index) => ({id: index, name: accept}));
            },
            initialValue: 0,
            hide: (values) => {
                return values?.type !== "ENUM"
            },
        },
        {
            label: "Mô tả",
            name: "description",
            component: <Input.TextArea style={{height: 100}}/>,
        },
    ];

    return (
        <>
            <Button onClick={() => navigate(`/attendance?semester=${searchParams.get("semester")}`)}>Điểm danh</Button>
            <Index route="/activities" params={searchParams.get("semester") ? {semester: searchParams.get("semester")} : null} name="Hoạt động" columns={columns} createForm={form} preCreate={pre} preUpdate={pre} updateForm={form}/>
        </>
    );
}

export default Activity;