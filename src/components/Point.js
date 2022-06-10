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
import { calculatePoint } from "./StudentPoint";
import { Option } from "antd/es/mentions";
import CustomBreadcrumb from "./elements/CustomBreadcumb";
import { SettingOutlined } from "@ant-design/icons";
import List from "./template/List";

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
    ]);
    const [searchParams, setSearchParams] = useSearchParams();
    const semesterId = searchParams.get("semester");
    const navigate = useNavigate();
    const [data, setData] = useState({
        data: [],
    });
    const [classes, setClasses] = useState({
        data: [],
    });
    const [semester, setSemester] = useState({ year: {} });

    useEffect(async () => {
        const classes = await getClasses();
        setClasses(classes);
        getPoint();
        setSemester((await request.get(`/semesters/${semesterId}`)).data);
    }, []);

    const getPoint = async (classId = null) => {
        setData(await getData(classId));
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
        return (await request.get(`/point?semester=${semesterId}${_class}`))
            .data;
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
                title="Thống kê điểm"
                breadcrumb={
                    <CustomBreadcrumb
                        routes={[
                            { name: "Quản lý hoạt động", path: "/years" },
                            {
                                name: `Năm học ${semester.year.name}`,
                                path: `/semesters?year=${semester.year.id}`,
                            },
                            {
                                name: `Học kỳ ${semester.name}`,
                                path: `/activity_types?semester=${semester.id}`,
                            },
                            {
                                name: "Điểm",
                                path: `/points?semester=${semester.id}`,
                            },
                        ]}
                    />
                }
                extra={
                    <>
                        <Button
                            type="primary"
                            icon={<SettingOutlined />}
                            onClick={() =>
                                navigate(
                                    `/title_activities?semester=${semesterId}`
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
            <List
                columns={columns}
                data={data.data}
                buttons={(record) => [
                    <Button
                        onClick={() =>
                            navigate(
                                `/point?semester=${semesterId}&student=${record.id}`
                            )
                        }
                    >
                        Xem phiếu điểm
                    </Button>,
                ]}
            />
        </>
    );
}

export default Point;
