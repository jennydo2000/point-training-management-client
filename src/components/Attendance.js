import {Button, Input, Select, Space, Table, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import request from "../utils/request";
import {useSearchParams} from "react-router-dom";
import {Option} from "antd/es/mentions";

function Attendance() {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState({
        data: [],
    });
    const [activities, setActivities] = useState([]);
    const [columns, setColumns] = useState([
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
            render: (text) => text === "male" ? "Nam" : "Nữ",
        },
        {
            title: "Ngày sinh",
            dataIndex: "dob",
            key: "dob",
            fixed: "left",
        },
    ]);

    useEffect(async () => {
        setData((await getData()).data);

        const activities = (await getActivities()).data;
        activities.data.forEach(activity => {
            columns.push({
                title: <Tooltip placement="bottom" title={activity.name}>{activity.code}</Tooltip>,
                dataIndex: "",
                key: activity.code,
                render: (text, record) => {
                    const studentActivity = record.student_activities.find(studentActivity => studentActivity.activity.id === activity.id);
                    if (activity.type === "ENUM") {
                        return <Select defaultValue={studentActivity?.value || activity.default_value} onChange={(value) => saveChange(record.id, activity.id, value)}>
                            {activity.accepts.map((accept, index) => <Option value={index}>{accept}</Option>)}
                        </Select>;
                    }
                    if (activity.type === "CHECK") {
                        return <Select defaultValue={studentActivity?.value || 0} onChange={(value) => saveChange(record.id, activity.id, value)}>
                            <Option value={0}>Không</Option>
                            <Option value={1}>Có</Option>
                        </Select>
                    }
                    else return <Input style={{width: "60px"}} type="number" defaultValue={studentActivity?.value || activity.default_value} onChange={(e) => saveChange(record.id, activity.id, e.target.value)}/>;
                },
            });
        });
        console.log(columns);
        setColumns([...columns]);
        setActivities();
    }, []);

    const getData = async () => {
        return await request.get("/attendance");
    }

    const getActivities = async () => {
        return await request.get(`/activities?semester=${searchParams.get("semester")}&type=all`);
    }

    const saveChange = async (student_id, activity_id, value) => {
        const data = {
            student_id: student_id,
            activity_id: activity_id,
            value: value,
        }
        console.log(data);
        await request.post("/attendance", data);
    }

    return (
        <Table scroll={{ x: "max-content" }} columns={columns} dataSource={data.data}/>
    );
}

export default Attendance;