import {Button, Input, PageHeader, Select, Space, Table, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useEffect, useRef, useState} from "react";
import request from "../utils/request";
import {useSearchParams} from "react-router-dom";
import {Option} from "antd/es/mentions";
import moment from "moment";
import {formatDate} from "../utils/functions";
import Title from "antd/es/typography/Title";
import FullHeightTable from "./elements/FullHeightTable";
import {getActivityType, getActivityTypeAction} from "./Activity";
import CustomBreadcrumb from "./elements/CustomBreadcumb";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const activityId = searchParams.get("activity");
    const [data, setData] = useState({
        data: [],
    });
    const [classes, setClasses] = useState({
        data: [],
    });
    const [columns, setColumns] = useState([]);
    const [activity, setActivity] = useState({semester: {year: {}}});

    useEffect(async () => {
        const classes = await getClasses()
        setClasses(classes);
        getAttendance();
        setActivity((await request.get(`/activities/${activityId}`)).data);
    }, []);

    const getAttendance = async (classId = null) => {
        setData(await getData(classId));
        let activities = {data: []};
        if (activityId) activities.data = [(await getActivity(activityId))];
        else activities = (await getActivities(searchParams.get("semester"), searchParams.get("activity_type"))).data;
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
    }

    const updateSearchParams = (key, value) => {
        const params = {};
        searchParams.forEach((value, key) => params[key] = value);
        params[key] = value;
        setSearchParams(params, {replace: true});
    }

    const getData = async (classId = null) => {
        let _class = '';
        if (classId) _class = `?class=${classId}`;
        return (await request.get(`/attendance${_class}`)).data;
    }

    const getActivity = async (id) => {
        return (await request.get(`/activities/${id}`)).data;
    }

    const getClasses = async () => {
        return (await request.get(`/classes`)).data;
    }

    const getActivities = async (semesterId, activityTypeId) => {
        return await request.get(`/activities?semester=${semesterId}&type=all&activity_type=${activityTypeId}`);
    }

    const selectClass = async (id) => {
        updateSearchParams("class", id);
        getAttendance(id);
    }

    return (
        <>
            <PageHeader
                style={{width: "100%", backgroundColor: "white", marginBottom: 10}}
                title="Điểm danh"
                breadcrumb={
                    <CustomBreadcrumb routes={[
                        {name: "Quản lý hoạt động", path: "/years"},
                        {name: `Năm học ${activity.semester.year.name}`, path: `/semesters?year=${activity.semester.year.id}`},
                        {name: `Học kỳ ${activity.semester.name}`, path: `/activity_types?semester=${activity.semester.id}`},
                        {name: getActivityType(activity.activity_type_id), path: `/activities?activity_type=${activity.activity_type_id}&semester=${activity.semester.id}`},
                        {name: activity.name, path: `/attendance?activity=${activity.id}`},
                    ]} />
                }
                extra={
                    <>
                        <Space style={{width: "100%"}}>
                            <span>Chọn lớp: </span>
                            <Select style={{width: "200px"}} value={parseInt(searchParams.get("class")) || null} onChange={(value) => selectClass(value)}>
                                <Option value={null}>Hiển thị tất cả</Option>
                                {classes.data.map((_class, index) => 
                                    <Option key={index} value={_class.id}>{_class.name}</Option>
                                )}
                            </Select>
                        </Space>
                    </>
                }
            />
            <FullHeightTable width="max-content" components={{body: {cell: EditableCell}}} columns={columns} dataSource={data.data} bordered/>
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

    useEffect(() => {
        setStudent(record);
    }, [record]);

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
                        <Select.Option value={0}>Không {getActivityTypeAction(activity.activity_type_id)}</Select.Option>
                        <Select.Option value={1}>Có {getActivityTypeAction(activity.activity_type_id)}</Select.Option>
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
                    {studentActivity?.value ? `Có ${getActivityTypeAction(activity.activity_type_id)}` : `Không ${getActivityTypeAction(activity.activity_type_id)}`}
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