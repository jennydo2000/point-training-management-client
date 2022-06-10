import Index from "./template/Index";
import {Button, DatePicker, Input} from "antd";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import request from "../utils/request";
import moment from "moment";
import {CheckOutlined} from "@ant-design/icons";
import { useEffect, useState } from "react";

export const getActivityType = (id) => {
    switch (id) {
        case 1: return "hoạt động";
        case 2: return "khen thưởng";
        case 3: return "vi phạm";
    }
}

export const getActivityTypeAction = (id) => {
    switch (id) {
        case 1: return "tham gia";
        case 2: return "nhận khen thưởng";
        case 3: return "bị vi phạm";
    }
}

const pre = (values) => {
    values.accepts = Array.isArray(values.accepts) ? values.array : values.accepts ? values.accepts.replaceAll(", ", ",").split(",") : null;
    values.default_value = values.default_value || 0;
    return values;
}

function Activity() {
    const [searchParams] = useSearchParams();
    const semesterId = searchParams.get("semester");
    const navigate = useNavigate();
    const activityTypeId = parseInt(searchParams.get("activity_type"));
    const activityType = getActivityType(activityTypeId);
    const activityTypeAction = getActivityTypeAction(activityTypeId);
    const [semester, setSemester] = useState({year: {}});

    useEffect(async () => {
        setSemester((await request.get(`/semesters/${semesterId}`)).data);
    }, []);

    const columns = [
        {
            title: `Mã ${activityType}`,
            dataIndex: "code",
            key: "code",
        },
        {
            title: `Tên ${activityType}`,
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

    const form = [
        {
            label: "Học kỳ",
            name: "semester_id",
            type: "hidden",
            initialValue: parseInt(searchParams.get("semester")) || null,
            hide: () => searchParams.get("semester") === null,
        },
        {
            label: `Loại`,
            name: "activity_type_id",
            type: "hidden",
            initialValue: parseInt(searchParams.get("activity_type")) || null,
            hide: () => searchParams.get("activity_type") === null,
        },
        {
            label: `Mã ${activityType}`,
            name: "code",
        },
        {
            label: `Tên ${activityType}`,
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
            label: "Kiểu",
            name: "type",
            type: "select",
            options: [
                {id: "CHECK", name: "Đánh dấu"},
                {id: "COUNT", name: "Đếm số lần"},
                {id: "ENUM", name: "Lựa chọn"},
                {id: "POINT", name: "Điểm"},
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
            type: "select",
            options: [
                {id: 0, name: `Không ${activityTypeAction}`},
                {id: 1, name: `Có ${activityTypeAction}`}
            ],
            initialValue: 0,
            hide: (values) => {
                return values?.type !== "CHECK" && values?.type
            },
        },
        {
            label: "Mặc định",
            name: "default_value",
            type: "number",
            initialValue: 0,
            hide: (values) => {
                return values?.type !== "COUNT"
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

    const listButtons = (record) => (
        <Button onClick={() => navigate(`/attendance?activity=${record.id}`)} icon={<CheckOutlined/>}/>
    );

    return (
        <>
            <Index
                route="/activities"
                params={getParams()}
                name={activityType.charAt(0).toUpperCase() + activityType.slice(1)}
                routes={[
                    {name: "Quản lý hoạt động", path: "/years"},
                    {name: `Năm học ${semester.year.name}`, path: `/semesters?year=${semester.year.id}`},
                    {name: `Học kỳ ${semester.name}`, path: `/activity_types?semester=${semester.id}`},
                    {name: activityType, path: `/activities?activity_type=${activityTypeId}&semester=${semester.id}`},
                ]}
                buttons={searchParams.get("semester") && buttons}
                listButtons={listButtons}
                columns={columns}
                createForm={form}
                preCreate={pre}
                preUpdate={pre}
                updateForm={form}/>
        </>
    );
}

export default Activity;