import {Button, Space, Tooltip, Typography} from "antd";
import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import request from "../utils/request";
import Text from "antd/es/typography/Text";
import Title from "antd/es/typography/Title";
import FullHeightTable from "./elements/FullHeightTable";
import {getActivityTypeAction} from "./Activity";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import TimesNewRomanNormal from "../fonts/TimesNewRomanNormal";
import TimesNewRomanBold from "../fonts/TimesNewRomanBold";
import TimesNewRomanItalic from "../fonts/TimesNewRomanItalic";
import TimesNewRomanBoldItalic from "../fonts/TimesNewRomanBoldItalic";
import { flattenTitles } from "./TitleActivity";

const markToString = (mark) => {
    switch (mark) {
        case "eq": return "bằng";
        case "gt": return "lớn hơn";
        case "lt": return "nhỏ hơn";
        case "gte": return "lớn hơn hoặc bằng";
        case "lte": return "nhỏ hơn hoặc bằng";
    }
}

const renderPoint = (point) => {
    if (point > 0) return <Text style={{display: "inline"}} keyboard type="success">+{point} điểm</Text>;
    else if (point < 0) return <Text style={{display: "inline"}} keyboard type="danger">{point} điểm</Text>;
    else return <Text style={{display: "inline"}} keyboard type="warning">0 điểm</Text>;
}

export const calculatePoint = (thirdTitleActivity) => {
    if (thirdTitleActivity.type !== "third") return "";
    if (thirdTitleActivity.title_activities.length === 0) return thirdTitleActivity.max_point;
    let point = thirdTitleActivity.title_activities.reduce((point, titleActivity) => {
        const activity = titleActivity.activity;
        if (!activity.student_activity) return point;
        const studentActivity = activity.student_activity;
        const studentValue = studentActivity.value || activity.default_value || 0;
        if (activity.type === "CHECK") {
            return point + titleActivity.point[studentValue];
        }
        else if (activity.type === "COUNT" || activity.type === "POINT") {
            let currentPoint = activity.default_value || 0;
            if (activity.type === "COUNT") currentPoint = studentValue * titleActivity.point[0];
            titleActivity.options.map(option => {
                switch (option.type) {
                    case "eq":
                        if (studentValue === parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "gt":
                        if (studentValue > parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "lt":
                        if (studentValue < parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "gte":
                        if (studentValue >= parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "lte":
                        if (studentValue <= parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                }
            });
            return point + currentPoint;
        }
        else if (activity.type === "ENUM")
            return point + titleActivity.point[studentValue];
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
            width: 120,
        },
        {
            title: "Điểm mặc định",
            dataIndex: "default_point",
            key: "default_point",
            width: 130,
        },
        {
            title: "Điểm",
            dataIndex: "point",
            key: "point",
            width: 150,
        },
        {
            title: "Lý do cộng điểm",
            dataIndex: "",
            key: "reason",
            width: 300,
            render: (text, record) => {
                if (record.type !== "third") return "";
                if (record.reason.length === 0) return "Không có mục cộng điểm, cộng tối đa";
                return record.reason.map(reason => reason.html);
            }
        },
        {
            title: "Mục xét duyệt",
            dataIndex: "",
            key: "description",
            render: (text, record) => {
                if (record.type !== "third") return "";
                if (!record.description) return "Không có mục cộng điểm";
                return record.description.map(description => description.html);
            }
        },
    ];
    const [searchParams] = useSearchParams();
    const semesterId = searchParams.get("semester");
    const studentId = searchParams.get("student");
    const [data, setData] = useState({
        data: [],
        student: {
            user: {},
            class: {
                major: {
                    department: {}
                }
            },
        },
        semester: {
            year: {},
        }
    });

    useEffect(async () => {
        const newData = (await getData());
        const flattenData = flattenTitles(newData.data);

        let maxPointSum = 0;
        let pointSum = 0;
        flattenData.map(title => {
            if (title.type === "third") {
                pointSum += title.point;
                maxPointSum += title.max_point;
                title.reason = getReason(title);
                title.description = getDescription(title);
            }
        });

        flattenData.push({
            type: "sum",
            title: "Tổng cộng",
            point: pointSum,
            max_point: `${maxPointSum} (Tối đa 100 điểm)`,
        });

        console.log(flattenData);

        data.data = flattenData;
        data.student = newData.student;
        setData({...data});
    }, []);

    const getData = async () => {
        return (await request.get(`/point?semester=${semesterId}&student=${studentId}`)).data;
    }

    const getReason = (thirdTitle) => {
        if (thirdTitle.type !== "third") return "";
        if (thirdTitle.title_activities.length === 0) return [];
        return thirdTitle.title_activities.map((titleActivity) => {
            const activity = titleActivity.activity;
            const studentActivity = activity.student_activity;
            if (activity.type === "CHECK") {
                return {
                    html: (
                        <Tooltip title={activity.name} placement="left">
                            <Text
                                style={{display: "block"}}
                                keyboard
                            >
                                <b>[{activity.code}]</b> {(studentActivity?.value === 1) ? "Có" : "Không"} {getActivityTypeAction(activity.activity_type_id)}
                            </Text>
                        </Tooltip>
                    ),
                    text: `[${activity.code}] ${(studentActivity?.value === 1) ? "Có" : "Không"} ${getActivityTypeAction(activity.activity_type_id)}`,
                };
            }
            else if (activity.type === "COUNT") {
                return {
                    html: (
                        <Tooltip title={activity.name} placement="left">
                            <Text
                                style={{display: "block"}}
                                keyboard
                            >
                                <b>[{activity.code}]</b> {studentActivity?.value || 0} lần {getActivityTypeAction(activity.activity_type_id)}
                            </Text>
                        </Tooltip>
                    ),
                    text: `[${activity.code}] ${studentActivity?.value || 0} lần ${getActivityTypeAction(activity.activity_type_id)}`,
                };
            }
            else if (activity.type === "POINT") {
                return {
                    html: (
                        <Tooltip title={activity.name} placement="left">
                            <Text
                                style={{display: "block"}}
                                keyboard
                            >
                                <b>[{activity.code}]</b> Điểm {getActivityTypeAction(activity.activity_type_id)} đạt {studentActivity?.value || 0} điểm
                            </Text>
                        </Tooltip>
                    ),
                    text: `[${activity.code}] Điểm ${getActivityTypeAction(activity.activity_type_id)} đạt ${studentActivity?.value || 0} điểm`,
                };
            }
            else if (activity.type === "ENUM") {
                return {
                    html: (
                        <Tooltip title={activity.name} placement="left">
                            <Text
                                style={{display: "block"}}
                                keyboard
                            >
                                <b>[{activity.code}]</b> {activity.accepts[studentActivity?.value || activity.default_value]}
                            </Text>
                        </Tooltip>
                    ),
                    text: `[${activity.code}] ${activity.accepts[studentActivity?.value || activity.default_value]}`,
                };
            }
            else return {
                html: <></>,
                text: '',
            };
        });
    }

    const getDescription = (titleActivity) => {
        if (titleActivity.type !== "third") return "";
        return titleActivity.title_activities.map((titleActivity) => {
            const activity = titleActivity.activity;
            if (activity.type === "CHECK") {
                return {
                    html: (
                        <>
                            <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                            <Typography>Có {getActivityTypeAction(activity.activity_type_id)}: {renderPoint(titleActivity.point[1])}</Typography>
                            <Typography>Không {getActivityTypeAction(activity.activity_type_id)}: {renderPoint(titleActivity.point[0])}</Typography>
                        </>
                    ),
                    text: `[${activity.code}] ${activity.name}\nCó ${getActivityTypeAction(activity.activity_type_id)}: ${titleActivity.point[1]}\nKhông ${getActivityTypeAction(activity.activity_type_id)}: ${titleActivity.point[0]}`,
                };
            } else if (activity.type === "COUNT") {
                const optionString = titleActivity.options.map(option => `Nếu số lần ${getActivityTypeAction(activity.activity_type_id)} ${option.type} ${option.value} thì điểm ${option.point}`).join("\n");
                return {
                    html: (
                        <>
                            <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                            <Typography>Mỗi
                                lần {getActivityTypeAction(activity.activity_type_id)}: {renderPoint(titleActivity.point[0])}</Typography>
                            {titleActivity.options.map((option, index) =>
                                <Typography key={index}>Nếu số
                                    lần {getActivityTypeAction(activity.activity_type_id)} {markToString(option.type)}
                                    <Text
                                        keyboard>{option.value}</Text> thì điểm {renderPoint(option.point)}</Typography>
                            )}
                        </>
                    ),
                    text: `[${activity.code}] ${activity.name}\nMỗi lần ${getActivityTypeAction(activity.activity_type_id)}: ${titleActivity.point[0]}\n${optionString}`,
                };
            }
            else if (activity.type === "POINT") {
                const optionString = titleActivity.options.map(option => `Nếu ${getActivityTypeAction(activity.activity_type_id)} số điểm ${option.type} ${option.value} thì điểm ${option.point}`).join("\n");
                return {
                    html: (
                        <>
                            <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                            {titleActivity.options.map((option, index) =>
                                <Typography key={index}>Nếu {getActivityTypeAction(activity.activity_type_id)} số
                                    điểm {markToString(option.type)} <Text keyboard>{option.value} điểm</Text> thì
                                    điểm {renderPoint(option.point)}</Typography>
                            )}
                        </>
                    ),
                    text: `[${activity.code}] ${activity.name}\n${optionString}`,
                };
            }
            else if (activity.type === "ENUM") {
                const acceptString = activity.accepts.map((accept, index) => `${accept}: ${titleActivity.point[index] || 'Không'}`).join("\n");
                return {
                    html: (
                        <>
                            <Typography style={{fontWeight: "bold"}}>[{activity.code}] {activity.name}</Typography>
                            {activity.accepts.map((accept, index) =>
                                <Typography
                                    key={index}>{accept}: {renderPoint(titleActivity.point[index]) || 'Không'}</Typography>
                            )}
                        </>
                    ),
                    text: `[${activity.code}] ${activity.name}\n${acceptString}`,
                };
            }
            else return {
                html: <></>,
                text: '',
            };
        })
    }

    const handlePrint = async () => {
        const doc = new jsPDF({
            orientation: "p",
            unit: "cm",
            format: "a4",
        });

        doc.addFileToVFS('TimesNewRomanNormal.ttf', TimesNewRomanNormal);
        doc.addFileToVFS('TimesNewRomanBold.ttf', TimesNewRomanBold);
        doc.addFileToVFS('TimesNewRomanItalic.ttf', TimesNewRomanItalic);
        doc.addFileToVFS('TimesNewRomanBolditalic.ttf', TimesNewRomanBoldItalic);
        doc.addFont('TimesNewRomanNormal.ttf', 'Times New Roman', 'normal');
        doc.addFont('TimesNewRomanBold.ttf', 'Times New Roman', 'bold');
        doc.addFont('TimesNewRomanItalic.ttf', 'Times New Roman', 'italic');
        doc.addFont('TimesNewRomanBolditalic.ttf', 'Times New Roman', 'bolditalic');

        doc.setFont("Times New Roman", "normal");
        doc.setFontSize(12);
        doc.text(5, 1, "ĐẠI HỌC ĐÀ NẴNG", {align: "center"});

        doc.setFont("Times New Roman", "bold");
        doc.text(5, 1.6, "PHÂN HIỆU ĐHĐN TẠI KON TUM", {align: "center"});
        doc.setLineWidth(0.025);
        doc.line(3, 1.8, 7, 1.8);

        doc.text(15, 1, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", {align: "center"});
        doc.text(15, 1.6, "Độc lập - Tự do - Hạnh phúc", {align: "center"});
        doc.line(13, 1.8, 17, 1.8);

        doc.setFont("Times New Roman", "bold");
        doc.setFontSize(13);
        doc.text(10, 2.6, "PHIẾU ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN CỦA SINH VIÊN", {align: "center"});
        doc.text(10, 3.2, `HỌC KỲ ${data.sheet.semester.name} NĂM HỌC ${data.sheet.semester.year.name}`, {align: "center"});

        doc.setFont("Times New Roman", "normal");
        doc.setFontSize(12);

        doc.text(2, 4, `Họ và tên sinh viên: ${data.student.user.first_name}  ${data.student.user.last_name}`);
        doc.text(10, 4, `Mã số sinh viên: ${data.student.student_code}`);
        doc.text(2, 4.6, `Lớp : ${data.student.class.name}`);
        doc.text(6, 4.6, `Khóa : ${data.student.class.name?.substring(0, 3)}`);
        doc.text(10, 4.6, `Khoa : ${data.student.class.major.department.name}`);

        const columns = [
            {header: "Nội dung và tiêu chí đánh giá", dataKey: "title"},
            {header: "Khung điểm", dataKey: "max_point"},
            {header: "Điểm", dataKey: "point"},
            {header: "Lý do cộng điểm", dataKey: "reason"},
            {header: "Mô tả", dataKey: "description"},
        ];

        const body = data.data.map(titleActivity => {
            let reasonText = '';
            if (titleActivity.type === "third") {
                if (titleActivity.reason.length > 0)
                    titleActivity.reason.forEach(reason => reasonText += `${reason.text}\n`);
                else reasonText = "Không có mục cộng điểm, cộng tối đa";
            }

            let descriptionText = '';
            if (titleActivity.type === "third") {
                if (titleActivity.description.length > 0)
                    titleActivity.description.forEach(description => descriptionText += `${description.text}\n`);
                else descriptionText = "Không có mục cộng điểm";
            }

            const row = {
                title: titleActivity.title,
                max_point: titleActivity.max_point || '',
                point: titleActivity.point || '',
                reason: reasonText,
                description: descriptionText,
            };
            return row;
        });

        doc.autoTable(
            columns.filter(column => ["title", "max_point", "point", "reason"].includes(column.dataKey)),
            body,
            {
                startY: 5,
                columnWidth: 'wrap',
                columnStyles: {
                    title: {cellWidth: 8, valign: "middle"},
                    max_point: {cellWidth: 2, halign: "center", valign: "middle"},
                    point: {cellWidth: 2, halign: "center", valign: "middle"},
                    reason: {cellWidth: 6, valign: "middle"},
                },
                headStyles: { halign: "center" },
                styles: {
                    font: "Times New Roman",
                    fontStyle: 'normal',
                    fontSize: 12,
                }
            },
        );

        doc.addPage();
        doc.text(10, 2, "HƯỚNG DẪN CỘNG ĐIỂM", {align: "center"});
        doc.autoTable(
            columns.filter(column => ["title", "description"].includes(column.dataKey)),
            body,
            {
                startY: 3,
                columnWidth: 'wrap',
                columnStyles: {
                    title: {cellWidth: 10, valign: "middle"},
                    description: {cellWidth: 8, valign: "middle"},
                },
                headStyles: { halign: "center" },
                styles: {
                    font: "Times New Roman",
                    fontStyle: 'normal',
                    fontSize: 12,
                }
            },
        );

        var string = doc.output('datauristring');
        var embed = "<embed width='100%' height='100%' src='" + string + "'/>"
        var x = window.open();
        x.document.open();
        x.document.write(embed);
        x.document.close();
    }

    return (
        <>
            <Title style={{textAlign: "center"}}>Đánh giá kết quả rèn luyện của sinh viên</Title>
            <Button onClick={handlePrint}>In phiếu</Button>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}} id="print">
                <Space size="large">
                    <Text>Họ và tên: {data.student.user.first_name} {data.student.user.last_name}</Text>
                    <Text>MSSV: {data.student.student_code}</Text>
                </Space>
                <Space size="large">
                    <Text>Lớp: {data.student.class.name}</Text>
                    <Text>Khóa: {data.student.class.name?.substring(0, 3)}</Text>
                    <Text>Khoa: {data.student.class.major.department.name}</Text>
                </Space>
            </div>
            <FullHeightTable columns={columns} dataSource={data.data} pagination={false} sticky bordered/>
        </>
    );
}

export default StudentPoint;