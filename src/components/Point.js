import {
    Button,
    PageHeader,
    Select,
    Space,
    Table,
    Tooltip,
    Typography,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { convertTitles } from "./TitleActivity";
import request from "../utils/request";
import Text from "antd/es/typography/Text";
import { formatDate } from "../utils/functions";
import FullHeightTable from "./elements/FullHeightTable";
import Title from "antd/es/typography/Title";
import { calculatePoint } from "./StudentPoint";
import { Option } from "antd/es/mentions";
import CustomBreadcrumb from "./elements/CustomBreadcumb";

const markToString = (mark) => {
    switch (mark) {
        case "eq":
            return "bằng";
        case "gt":
            return "lớn hơn";
        case "lt":
            return "nhỏ hơn";
        case "gte":
            return "lớn hơn hoặc bằng";
        case "lte":
            return "nhỏ hơn hoặc bằng";
    }
};

const getActivityType = (id) => {
    switch (id) {
        case 1:
            return "tham gia";
        case 2:
            return "nhận khen thưởng";
        case 3:
            return "bị vi phạm";
    }
};

const renderPoint = (point) => {
    if (point === null)
        return (
            <Text style={{ display: "inline" }} keyboard>
                Không
            </Text>
        );
    else if (point === 0)
        return (
            <Text style={{ display: "inline" }} keyboard type="warning">
                {point} điểm
            </Text>
        );
    if (point > 0)
        return (
            <Text style={{ display: "inline" }} keyboard type="success">
                +{point} điểm
            </Text>
        );
    else
        return (
            <Text style={{ display: "inline" }} keyboard type="danger">
                {point} điểm
            </Text>
        );
};

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
            render: (text, record) => (
                <>
                    {record.user.first_name} {record.user.last_name}
                </>
            ),
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            fixed: "left",
            render: (text) => (text === "male" ? "Nam" : "Nữ"),
        },
        {
            title: "Ngày sinh",
            dataIndex: "dob",
            key: "dob",
            fixed: "left",
            render: (text) => formatDate(text),
        },
        {
            title: "Điểm",
            dataIndex: "point",
            key: "point",
        },
        {
            title: "Xếp loại",
            dataIndex: "point",
            key: "grade",
            render: (text) => {
                if (text >= 90) return "Xuất sắc";
                else if (text >= 80) return "Tốt";
                else if (text >= 65) return "Khá";
                else if (text >= 50) return "Trung bình";
                else if (text >= 35) return "Yếu";
                else return "Kém";
            },
        },
        {
            title: "Xem phiếu điểm",
            dataIndex: "point",
            key: "point",
            render: (text, record) => (
                <Button
                    onClick={() =>
                        navigate(
                            `/point?sheet=${searchParams.get(
                                "sheet"
                            )}&student=${record.id}`
                        )
                    }
                >
                    Xem phiếu điểm
                </Button>
            ),
        },
    ]);
    const [searchParams, setSearchParams] = useSearchParams();
    const sheetId = searchParams.get("sheet");
    const navigate = useNavigate();
    const [data, setData] = useState({
        data: [],
    });
    const [classes, setClasses] = useState({
        data: [],
    });
    const [students, setStudents] = useState({
        data: [],
    });
    const [sheet, setSheet] = useState({ semester: {year: {}} });

    useEffect(async () => {
        const classes = await getClasses();
        setClasses(classes);
        updateSearchParams("class", classes.data[0]?.id);
        getPoint(classes.data[0]?.id);
        setSheet((await request.get(`/sheets/${sheetId}`)).data);
    }, []);

    const getPoint = async (classId = null) => {
        const newData = await getData(classId);
        const convertedTitles = convertTitles(newData.data);
        const convertedStudents = convertStudents(
            newData.students,
            convertedTitles
        );
        setStudents({ data: convertedStudents });
        data.data = convertedTitles;
        setData({ ...data });
    };

    const convertStudents = (students, convertTitles) => {
        const convertedStudents = students.map((student) => {
            student.point = 0;
            convertTitles.forEach((title) => {
                if (title.type === "third") {
                    const copiedThirdTitle = JSON.parse(JSON.stringify(title));
                    copiedThirdTitle.title_activities.forEach(
                        (title_activity) => {
                            const student_activity =
                                title_activity.activity.student_activities.find(
                                    (student_activity) =>
                                        student.id ===
                                        student_activity.student_id
                                );
                            delete title_activity.activity.student_activities;
                            title_activity.activity.student_activity =
                                student_activity || {};
                        }
                    );
                    const point = calculatePoint(copiedThirdTitle);
                    student.point += point;
                }
            });
            return student;
        });
        return convertedStudents;
    };

    const updateSearchParams = (key, value) => {
        const params = {};
        searchParams.forEach((value, key) => (params[key] = value));
        params[key] = value;
        setSearchParams(params, { replace: true });
    };

    const getData = async (classId) => {
        let _class = "";
        if (classId) _class = `&class=${classId}`;
        return (
            await request.get(
                `/point?sheet=${searchParams.get("sheet")}${_class}`
            )
        ).data;
    };

    const getClasses = async () => {
        return (await request.get(`/classes`)).data;
    };

    const selectClass = async (id) => {
        updateSearchParams("class", id);
        getPoint(id);
    };
    return (
        <>
            <PageHeader
                style={{
                    width: "100%",
                    backgroundColor: "white",
                    marginBottom: 10,
                }}
                title="Bảng điểm"
                breadcrumb={
                    <CustomBreadcrumb routes={[
                        {name: "Quản lý hoạt động", path: "/years"},
                        {name: `Năm học ${sheet.semester.year.name}`, path: `/semesters?year=${sheet.semester.year.id}`},
                        {name: `Học kỳ ${sheet.semester.name}`, path: `/activity_types?semester=${sheet.semester.id}`},
                        {name: "Phiếu điểm", path: `/sheets?semester=${sheet.semester.id}`},
                        {name: `${sheet.name}`, path: `/points?sheet=${sheet.id}`},
                    ]} />
                }
                extra={
                    <>
                        <Button
                            onClick={() =>
                                navigate(
                                    `/title_activities?sheet=${searchParams.get(
                                        "sheet"
                                    )}`
                                )
                            }
                        >
                            Cấu hình phiếu điểm
                        </Button>
                        <Space style={{ width: "100%", marginBottom: 5 }}>
                            <span>Chọn lớp: </span>
                            <Select
                                style={{ width: "200px" }}
                                value={
                                    parseInt(searchParams.get("class")) || null
                                }
                                onChange={(value) => selectClass(value)}
                            >
                                <Option value={null}>Hiển thị tất cả</Option>
                                {classes.data.map((_class, index) => (
                                    <Option key={index} value={_class.id}>
                                        {_class.name}
                                    </Option>
                                ))}
                            </Select>
                        </Space>
                    </>
                }
            />
            <FullHeightTable
                columns={columns}
                dataSource={students.data}
                pagination={false}
                sticky
            />
        </>
    );
}

export default Point;
