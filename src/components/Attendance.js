import {Button, Input, Select, Space, Table, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useEffect, useRef, useState} from "react";
import request from "../utils/request";
import {useSearchParams} from "react-router-dom";
import {Option} from "antd/es/mentions";
import moment from "moment";
import {formatDate} from "../utils/functions";
import Title from "antd/es/typography/Title";
import FullHeightTable from "./elemtents/FullHeightTable";

const getActivityType = (id) => {
    switch (id) {
        case 1: return "tham gia";
        case 2: return "nhận khen thưởng";
        case 3: return "bị vi phạm";
    }
}

const initColumns = [
    {
        title: "Lớp",
        dataIndex: ["class", "name"],
        key: "class_name",
        fixed: "left",
    },
    {
        title: "MSSV",
        dataIndex: "student_code",
        key: "student_code",
        fixed: "left",
    },
    {
        title: "Họ và tên",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (text, record) => <>{record.user.first_name} {record.user.last_name}</>
    },
    {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        fixed: "left",
        width: 100,
        render: (text) => text === "male" ? "Nam" : "Nữ",
    },
];

function Attendance() {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState({
        data: [],
    });
    const [columns, setColumns] = useState([]);

    useEffect(async () => {
        setData((await getData()).data);
        const activities = (await getActivities()).data;
        const newColumns = [...initColumns];
        activities.data.forEach(activity => {
            newColumns.push({
                title: <Tooltip placement="bottom" title={activity.name}>{activity.code}</Tooltip>,
                dataIndex: "",
                key: activity.code,
                ellipsis: true,
                onCell: (record) => ({
                    record: record,
                    editable: true,
                    activity: activity,
                }),
            });
        });
        setColumns(newColumns);
    }, []);

    const getData = async () => {
        return await request.get("/attendance");
    }

    const getActivities = async () => {
        return await request.get(`/activities?semester=${searchParams.get("semester")}&type=all&activity_type=${searchParams.get("activity_type")}`);
    }

    return (
        <>
            <Title style={{textAlign: "center"}}>Điểm danh</Title>
            <FullHeightTable width="max-content" components={{body: {cell: EditableCell}}} columns={columns} dataSource={data.data} pagination={false} bordered/>
        </>
    );
}

const EditableCell = ({editable, activity, children, record,...restProps}) => {
    const [editing, setEditing] = useState(false);
    const [student, setStudent] = useState(record);
    const inputRef = useRef();

    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEditing = () => {
        setEditing(!editing);
    }

    const saveChange = async (student_id, activity_id, value) => {
        const data = {
            student_id: student_id,
            activity_id: activity_id,
            value: value,
        }

        if (!student.student_activities) student.student_activities = [];
        let studentActivity = student.student_activities?.find(studentActivity => studentActivity.activity_id === activity_id);
        if (studentActivity) studentActivity.value = value;
        else {
            studentActivity = data;
            student.student_activities.push(studentActivity);
        }
        setStudent(student);
        await request.post("/attendance", data);
    }

    let childNode = children;
    if (editable && student) {
        const studentActivity = student.student_activities?.find(studentActivity => studentActivity.activity_id === activity.id);
        const value = studentActivity?.value || activity.default_value || 0;
        if (editing) {
            if (activity.type === "ENUM") {
                childNode = (
                    <Select
                        ref={inputRef}
                        style={{minWidth: "100px"}}
                        onBlur={toggleEditing}
                        defaultValue={value}
                        onChange={(value) => saveChange(record.id, activity.id, value)}
                    >
                        {activity.accepts.map((accept, index) => <Select.Option key={index} value={index}>{accept}</Select.Option>)}
                    </Select>
                );
            }
            else if (activity.type === "CHECK") {
                 childNode = (
                    <Select
                        ref={inputRef}
                        style={{minWidth: "100px"}}
                        defaultValue={value}
                        onBlur={toggleEditing}
                        onChange={(value) => saveChange(record.id, activity.id, value)}
                    >
                        <Select.Option value={0}>Không {getActivityType(activity.activity_type_id)}</Select.Option>
                        <Select.Option value={1}>Có {getActivityType(activity.activity_type_id)}</Select.Option>
                    </Select>
                );
            } else childNode = (
                <Input
                    ref={inputRef}
                    style={{width: "65px"}}
                    type="number"
                    defaultValue={value}
                    onBlur={toggleEditing}
                    onChange={(e) => saveChange(record.id, activity.id, e.target.value)}
                />
            );
        } else {
            if (activity.type === "ENUM") childNode = (
                <div
                    onClick={toggleEditing}
                    style={{fontStyle: !studentActivity?.value ? "italic" : "initial", minWidth: "100px"}}
                >
                    {activity.accepts[value]}
                </div>
            );
            else if (activity.type === "CHECK") childNode = (
                <div
                    onClick={toggleEditing}
                    style={{fontStyle: !studentActivity?.value ? "italic" : "initial", minWidth: "100px"}}
                >
                    {studentActivity?.value ? `Có ${getActivityType(activity.activity_type_id)}` : `Không ${getActivityType(activity.activity_type_id)}`}
                </div>);
            else childNode = (
                <div
                    onClick={toggleEditing}
                    style={{fontStyle: !studentActivity?.value ? "italic" : "initial", width: "65px"}}
                >
                    {value}
                </div>);
        }
    }
    return <td {...restProps}>{childNode}</td>
}

export default Attendance;