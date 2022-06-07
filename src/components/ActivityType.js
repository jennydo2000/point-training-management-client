import {Button, Card, Col, PageHeader, Row, Statistic} from "antd";
import {useNavigate, useSearchParams} from "react-router-dom";
import { FileTextOutlined, FrownOutlined, IdcardOutlined, TrophyOutlined } from "@ant-design/icons";
import CustomBreadcrumb from "./elements/CustomBreadcumb";
import { useEffect, useState } from "react";
import request from "../utils/request";

function ActivityType() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const semesterId = searchParams.get("semester");
    const [semester, setSemester] = useState({year: {}, activities: []});

    useEffect(async () => {
        setSemester((await request.get(`/semesters/${semesterId}`)).data);
    }, []);

    const navigateTo = (activityType) => {
        let url = "";
        if (searchParams.get("semester")) url = `&semester=${searchParams.get("semester")}`;
        navigate(`/activities?activity_type=${activityType}${url}`);
    }

    const navigateToSheet = () => {
        let url = "";
        if (searchParams.get("semester")) url = `?semester=${searchParams.get("semester")}`;
        navigate(`/sheets${url}`);
    }

    return (
        <>
        <PageHeader
                style={{width: "100%", backgroundColor: "white", marginBottom: 10}}
                title="Quản lý hoạt động"
                breadcrumb={
                    <CustomBreadcrumb routes={[
                        {name: "Quản lý hoạt động", path: "/years"},
                        {name: `Năm học ${semester.year.name}`, path: `/semesters?year=${semester.year.id}`},
                        {name: `Học kỳ ${semester.name}`, path: `/activity_types?semester=${semester.id}`},
                    ]} />
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
                        <Statistic title="Phiếu điểm" value={semester.sheets} prefix={<FileTextOutlined />} />
                        <Button type="primary" onClick={() => navigateToSheet()}>Truy cập</Button>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default ActivityType;