import Index from "./template/Index";
import {Button, DatePicker, Input} from "antd";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import request from "../utils/request";
import moment from "moment";
import {CheckOutlined} from "@ant-design/icons";

const columns = [
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
            else if (!time_start && !time_end) return <>Cả học kỳ</>
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

    const importColumns = [
        {
            title: "Học kỳ",
            key: "semester_id",
            dataIndex: "semester_id",
            convert: (text) => parseInt(searchParams.get("semester")) || null,
        },
        {
            title: "Loại hoạt động",
            key: "activity_type_id",
            dataIndex: "activity_type_id",
            columnIndex: "B",
            convert: (text) => {
                if (text === "Hoạt động") return 1;
                else if (text === "Khen thưởng") return 2;
                else if (text === "Vi phạm") return 3;
                else return null;
            }
        },
        {
            title: "Mã hoạt động",
            key: "code",
            dataIndex: "code",
            columnIndex: "C",
        },
        {
            title: "Tên hoạt động",
            key: "name",
            dataIndex: "name",
            columnIndex: "D",
        },
        {
            title: "Thời gian bắt đầu",
            key: "time_start",
            dataIndex: "time_start",
            columnIndex: "E",
        },
        {
            title: "Thời gian kết thúc",
            key: "time_end",
            dataIndex: "time_end",
            columnIndex: "F",
        },
        {
            title: "Địa điểm",
            key: "address",
            dataIndex: "address",
            columnIndex: "G",
        },
        {
            title: "Đơn vị tổ chức",
            key: "host",
            dataIndex: "host",
            columnIndex: "H",
        },
        {
            title: "Mô tả",
            key: "description",
            dataIndex: "description",
            columnIndex: "I",
        },
        {
            title: "Kiểu hoạt động",
            key: "type",
            dataIndex: "type",
            columnIndex: "J",
            convert: (text) => {
                if (text === "Đánh dấu") return "CHECK";
                else if (text === "Đếm số lần") return "COUNT";
                else if (text === "Lựa chọn") return "ENUM";
                else return "???";
            }
        },
        {
            title: "Các lựa chọn",
            key: "accepts",
            dataIndex: "accepts",
            columnIndex: "K",
            convert: (text) => text?.split(",").map(accept => accept.trim()),
        },
        {
            title: "Giá trị mặc định",
            key: "default_value",
            dataIndex: "default_value",
            columnIndex: "L",
        },
    ];

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
            type: "hidden",
            initialValue: parseInt(searchParams.get("activity_type")) || null,
            hide: () => searchParams.get("activity_type") === null,
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
                if (values?.type === "ENUM")
                    if (typeof values?.accepts === "string") return values?.accepts?.split(",")?.map((accept, index) => ({id: index, name: accept.trim()}));
                    else return values.accepts?.map((accept, index) => ({id: index, name: accept}));
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

    const buttons = [
        <Button onClick={() => navigate(`/attendance?semester=${searchParams.get("semester")}&activity_type=${searchParams.get("activity_type")}`)} icon={<CheckOutlined/>}>Điểm danh</Button>,
    ];

    const getParams = () => {
        const params = {activity_type: searchParams.get("activity_type")};
        if (searchParams.get("semester")) params.semester = searchParams.get("semester");
        return params;
    }

    return (
        <>
            <Index
                route="/activities"
                params={getParams()}
                name="Hoạt động"
                buttons={searchParams.get("semester") && buttons}
                columns={columns}
                importColumns={importColumns}
                createForm={form}
                preCreate={pre}
                preUpdate={pre}
                updateForm={form}/>
        </>
    );
}

export default Activity;