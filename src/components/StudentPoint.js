import {Button, Table, Tooltip, Typography} from "antd";
import {useSearchParams} from "react-router-dom";
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

function StudentPoint() {
    const columns = [
        {
            title: "Tiêu chí đánh giá",
            dataIndex: "title",
            key: "title",
            render: (text, record) => {
                if (record.type === "primary") return <b>{text.toUpperCase()}</b>;
                else if (record.type === "secondary") return <b>{text}</b>;
                else return text;
            },
        },
        {
            title: "Điểm tối đa",
            dataIndex: "max_point",
            key: "max_point",
        },
        {
            title: "Điểm mặc định",
            dataIndex: "default_point",
            key: "default_point",
        },
        {
            title: "Điểm chấm tự động",
            dataIndex: "point",
            key: "point",
            render: (text, record) => text && <Text keyboard>{text}</Text>
        },
        {
            title: "Lý do",
            dataIndex: "",
            key: "reason",
            render: (text, record) => {
                if (record.type !== "third") return "";
                return record.title_activities.map((titleActivity) => {
                    const activity = titleActivity.activity;
                    const studentActivity = activity.student_activity;
                    if (activity.type === "CHECK")
                        return (
                            <Tooltip title={activity.name} placement="left">
                                <Text style={{display: "block"}} keyboard><b>[{activity.code}]</b> {(studentActivity?.value === 1) ? "Có" : "Không"} {getActivityType(activity.activity_type_id)}</Text>
                            </Tooltip>
                        );
                    else if (activity.type === "COUNT")
                        return (
                            <Tooltip title={activity.name} placement="left">
                                <Text style={{display: "block"}} keyboard><b>[{activity.code}]</b> {studentActivity?.value || 0} lần {getActivityType(activity.activity_type_id)}</Text>
                            </Tooltip>
                        );
                    else if (activity.type === "ENUM")
                        return (
                            <Tooltip title={activity.name} placement="left">
                                <Text style={{display: "block"}} keyboard><b>[{activity.code}]</b> {activity.accepts[studentActivity.value]}</Text>
                            </Tooltip>
                        );
                    else return <></>;
                });
            }
        },
        {
            title: "Mục xét duyệt",
            dataIndex: "",
            key: "config",
            render: (text, record) => {
                if (record.type !== "third") return "";
                return record.title_activities.map((titleActivity) => {
                    const activity = titleActivity.activity;
                    const studentActivity = activity.student_activity;
                    if (activity.type === "CHECK")
                        return (
                        <>
                            <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                            <Typography >Có {getActivityType(activity.activity_type_id)}: {renderPoint(titleActivity.point[0])}</Typography>
                        </>
                        );
                    else if (activity.type === "COUNT")
                        return (
                            <>
                                <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                                <Typography>Mỗi lần {getActivityType(activity.activity_type_id)}: {renderPoint(titleActivity.point[0])}</Typography>
                                {titleActivity.options.map((option, index) =>
                                    <Typography key={index}>Nếu số lần {getActivityType(activity.activity_type_id)} {markToString(option.type)} <Text keyboard>{option.value}</Text> thì điểm {renderPoint(option.point)}</Typography>
                                )}
                            </>
                        );
                    else if (activity.type === "ENUM")
                        return (
                            <>
                                <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                                {activity.accepts.map((accept, index) =>
                                    <Typography key={index}>{accept}: {renderPoint(titleActivity.point[index]) || 'Không'}</Typography>
                                )}
                            </>
                        );
                    else return <></>;
                });
            }
        },
    ];
    const [searchParams] = useSearchParams();
    const [data, setData] = useState({
        data: [],
    });

    useEffect(async () => {
        const newData = (await getData());
        const convertedData = convertTitles(newData.data);

        let maxPointSum = 0;
        let pointSum = 0;
        convertedData.map(title => {
            if (title.type === "third") {
                const point = calculatePoint(title);
                title.point = point;
                pointSum += point;
                maxPointSum += title.max_point;
            }
        });

        convertedData.push({
            type: "sum",
            title: <Text style={{fontWeight: "bold"}}>Tổng cộng</Text>,
            point: pointSum,
            max_point: `${maxPointSum} (Tối đa 100 điểm)`,
        });

        data.data = convertedData;
        setData({...data});
    }, []);

    const getData = async () => {
        return (await request.get(`/point?sheet=${searchParams.get("sheet")}&student=${searchParams.get("student")}`)).data;
    }

    return (
        <Table columns={columns} dataSource={data.data} pagination={false} sticky/>
    );
}

export default StudentPoint;