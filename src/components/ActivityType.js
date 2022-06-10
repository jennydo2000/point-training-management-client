import {Button, Card, Col, Modal, PageHeader, Row, Space, Statistic} from "antd";
import {useNavigate, useSearchParams} from "react-router-dom";
import { FileAddFilled, FileTextOutlined, FrownOutlined, IdcardOutlined, InboxOutlined, SaveOutlined, TrophyOutlined, UploadOutlined } from "@ant-design/icons";
import CustomBreadcrumb from "./elements/CustomBreadcumb";
import { useEffect, useState } from "react";
import request, { SERVER_URL } from "../utils/request";
import Import from "./template/Import";
import Dragger from "antd/lib/upload/Dragger";

const modalType = {
    CREATE: 0,
    EDIT: 1,
    DELETE: 2,
    IMPORT: 3,
    COPY: 4,
    SAVE: 5,
    LOAD: 6,
}

function ActivityType() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const semesterId = searchParams.get("semester");
    const [showModal, setShowModal] = useState(null);
    const [semester, setSemester] = useState({year: {}, activities: []});
    const [importErrors, setImportErrors] = useState([]);
    const [loadedData, setLoadedData] = useState({});

    const importColumns = [
        {
            key: "semester_id",
            dataIndex: "semester_id",
            columnIndex: "",
            hidden: true,
            convert: () => semesterId,
        },
        {
            title: `Loại`,
            key: "activity_type_id",
            dataIndex: "activity_type_id",
            columnIndex: "B",
            convert: (text) => {
                if (text === "Hoạt động") return 1;
                else if (text === "Khen thưởng") return 2;
                else if (text === "Vi phạm") return 3;
                else if (text === "Điểm") return 4;
                else return null;
            }
        },
        {
            title: `Mã họat động`,
            key: "code",
            dataIndex: "code",
            columnIndex: "C",
        },
        {
            title: `Tên hoạt động`,
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
            title: "Kiểu",
            key: "type",
            dataIndex: "type",
            columnIndex: "J",
            convert: (text) => {
                if (text === "Đánh dấu") return "CHECK";
                else if (text === "Đếm số lần") return "COUNT";
                else if (text === "Lựa chọn") return "ENUM";
                else if (text === "Điểm") return "POINT";
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

    useEffect(async () => {
        setSemester(await getSemester());
    }, [semesterId]);

    const getSemester = async () => {
        return (await request.get(`/semesters/${semesterId}`)).data;
    }

    const navigateTo = (activityType) => {
        let url = "";
        if (searchParams.get("semester")) url = `&semester=${searchParams.get("semester")}`;
        navigate(`/activities?activity_type=${activityType}${url}`);
    }

    const navigateToPoint = () => {
        navigate(`/points?semester=${semester.id}`);
    }

    const handleImport = async (rows) => {
        await request.post(`activities/import`, rows)
            .then(async res => {
                setSemester(await getSemester());
                close();
            })
            .catch(err => {
                const errors = err.response.data.errors.map(err => {
                    const error = err.param.replace("[", "").replace("]", "").split(".");
                    return {
                        index: parseInt(error[0]),
                        key: error[1],
                        message: err.msg,
                    }
                });
                setImportErrors(errors);
            });
    }

    const handleSaveData = async () => {
        window.open(`${SERVER_URL}/semesters/${semesterId}/save`, "_blank");
        close();
    }

    const handleLoadData = async () => {
        await request.post(`semesters/${semesterId}/load`, loadedData)
            .then(async res => {
                setSemester(await getSemester());
                close();
            })
            .catch(err => {});
    }

    const importFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const loadedFile = JSON.parse(e.target.result);
            setLoadedData(loadedFile);
        }

        reader.readAsText(file);
    }

    const close = () => {
        setShowModal(null);
        setImportErrors([]);
    }

    return (
        <>
        <PageHeader
                style={{width: "100%", backgroundColor: "white", marginBottom: 10}}
                title={semesterId ? "Hoạt động từng học kỳ" : "Hoạt động thường niên"}
                breadcrumb={
                    <CustomBreadcrumb routes={
                        semesterId ? [
                            {name: "Quản lý hoạt động", path: "/years"},
                            {name: `Năm học ${semester.year.name}`, path: `/semesters?year=${semester.year.id}`},
                            {name: `Học kỳ ${semester.name}`, path: `/activity_types?semester=${semester.id}`},
                        ] : [
                            {name: "Hoạt động thường niên", path: "/activity_types"},
                        ]
                    }
                    />
                }
                extra={
                    <>
                        <Button onClick={() => setShowModal(modalType.IMPORT)} icon={<FileAddFilled/>}>Nhập danh sách</Button>
                        <Button onClick={() => setShowModal(modalType.SAVE)} icon={<SaveOutlined />}>Lưu dữ liệu</Button>
                        <Button onClick={() => setShowModal(modalType.LOAD)} icon={<UploadOutlined />}>Nhập dữ liệu</Button>
                    </>
                }
            />
            <Row style={{width: "100%"}} gutter={[16, 16]}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Hoạt động" value={semester.activities.type1} prefix={<IdcardOutlined />} />
                        <Button type="primary" onClick={() => navigateTo(1)}>Truy cập</Button>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Khen thưởng" value={semester.activities.type2} prefix={<TrophyOutlined />} />
                        <Button type="primary" onClick={() => navigateTo(2)}>Truy cập</Button>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Vi phạm" value={semester.activities.type3} prefix={<FrownOutlined />} />
                        <Button type="primary" onClick={() => navigateTo(3)}>Truy cập</Button>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Thống kê điểm" prefix={<FileTextOutlined />} />
                        <Button type="primary" onClick={() => navigateToPoint()}>Truy cập</Button>
                    </Card>
                </Col>
            </Row>

            <Modal
                title={`Nhập hoạt động`}
                width={"100vw"}
                destroyOnClose
                centered
                visible={showModal === modalType.IMPORT}
                onCancel={close}
                footer={[]}
            >
                <Import errors={importErrors} columns={importColumns || []} onImport={handleImport}/>
            </Modal>

            <Modal
                title={`Lưu dữ liệu`}
                destroyOnClose
                centered
                visible={showModal === modalType.SAVE}
                onCancel={close}
                footer={[
                    <Button onClick={handleSaveData} type="primary">Lưu</Button>,
                    <Button onClick={close}>Hủy</Button>
                ]}
            >
            </Modal>

            <Modal
                title={`Nhập dữ liệu`}
                destroyOnClose
                centered
                visible={showModal === modalType.LOAD}
                onCancel={close}
                footer={[
                    <Button onClick={handleLoadData} type="primary">Nhập</Button>,
                    <Button onClick={close}>Hủy</Button>
                ]}
            >
                <Space direction="vertical" style={{width: "100%", alignItems: "center"}}>
                    <Dragger
                        beforeUpload={(file) => {
                            importFile(file);
                            return false;
                        }}
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Chọn hoặc kéo file vào khung nhập</p>
                    </Dragger>
                </Space>
            </Modal>
        </>
    );
}

export default ActivityType;