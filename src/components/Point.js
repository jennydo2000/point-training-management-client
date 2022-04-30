import {Button, Table, Tooltip, Typography} from "antd";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {convertTitles} from "./TitleActivity";
import request from "../utils/request";
import Text from "antd/es/typography/Text";

const markToString = (mark) => {
    switch (mark) {
        case "eq": return "bằng";
        case "gt": return "lớn hơn";
        case "lt": return "nhỏ hơn";
        case "gte": return "lớn hơn hoặc bằng";
        case "lte": return "nhỏ hơn hoặc bằng";
    }
}

const getActivityType = (id) => {
    switch (id) {
        case 1: return "tham gia";
        case 2: return "nhận khen thưởng";
        case 3: return "bị vi phạm";
    }
}

const renderPoint = (point) => {
    if (point === null)
        return <Text style={{display: "inline"}} keyboard>Không</Text>;
    else if (point === 0)
        return <Text style={{display: "inline"}} keyboard type="warning">{point} điểm</Text>;
    if (point > 0)
        return <Text style={{display: "inline"}} keyboard type="success">+{point} điểm</Text>;
    else return <Text style={{display: "inline"}} keyboard type="danger">{point} điểm</Text>;
}

const calculatePoint = (thirdTitleActivity) => {
    if (thirdTitleActivity.type !== "third") return "";
    let point = thirdTitleActivity.title_activities.reduce((point, titleActivity) => {
        const activity = titleActivity.activity;
        if (!activity.student_activity.value) return point;
        const studentActivity = activity.student_activity;
        if (activity.type === "CHECK")
            return point + titleActivity.point[0];
        else if (activity.type === "COUNT") {
            let currentPoint = studentActivity.value * titleActivity.point[0];
            titleActivity.options.map(option => {
                switch (option.type) {
                    case "eq":
                        if (studentActivity.value === parseInt(option.value)) currentPoint = option.point;
                        break;
                    case "gt":
                        if (studentActivity.value > parseInt(option.value)) currentPoint = option.point;
                        break;
                    case "lt":
                        if (studentActivity.value < parseInt(option.value)) currentPoint = option.point;
                        break;
                    case "gte":
                        if (studentActivity.value >= parseInt(option.value)) currentPoint = option.point;
                        break;
                    case "lte":
                        if (studentActivity.value <= parseInt(option.value)) currentPoint = option.point;
                        break;
                }
            });
            return point + currentPoint;
        }
        else if (activity.type === "ENUM")
            return point + titleActivity.point[studentActivity.value];
        else return point;
    }, thirdTitleActivity.default_point);
    return Math.min(Math.max(point, 0), thirdTitleActivity.max_point);
}

function Point() {
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
        {
            title: "Điểm",
            dataIndex: "point",
            key: "point",
        },
        {
            title: "Xem phiếu điểm",
            dataIndex: "point",
            key: "point",
            render: (text, record) => <Button onClick={() => navigate(`/point?sheet=${searchParams.get("sheet")}&student=${record.id}`)}>Xem phiếu điểm</Button>,
        },
    ]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState({
        data: [],
    });
    const [students, setStudents] = useState({
        data: [],
    });

    useEffect(async () => {
        const newData = (await getData());
        const convertedData = convertTitles(newData.data);

        const students = newData.students.map(student => {
            student.point = 0;
            convertedData.map(title => {
                if (title.type === "third") {
                    const copiedThirdTitle = JSON.parse(JSON.stringify(title));
                    copiedThirdTitle.title_activities.map(title_activity => {
                        const student_activity = title_activity.activity.student_activities.find(student_activity => student.id === student_activity.student_id);
                        delete title_activity.activity.student_activities;
                        title_activity.activity.student_activity = student_activity || {};
                    });
                    const point = calculatePoint(copiedThirdTitle);
                    student.point += point;
                }
            });
            return student;
        });

        console.log(students);

        setStudents({data: students});
        data.data = convertedData;
        setData({...data});
    }, []);

    const getData = async () => {
        return (await request.get(`/point?sheet=${searchParams.get("sheet")}`)).data;
    }

    return (
        <>
            <Table columns={columns} dataSource={students.data} pagination={false} sticky/>
        </>
    );
}

export default Point;