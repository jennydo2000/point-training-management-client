import {Button, Col, Row} from "antd";
import {useNavigate, useSearchParams} from "react-router-dom";

function ActivityType() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const navigateTo = (activityType) => {
        navigate(`/activities?semester=${searchParams.get("semester")}&activity_type=${activityType}`);
    }

    return (
        <Row style={{width: "100%"}}>
            <Col span={6}>
                <Button style={{width: "100%"}} onClick={() => navigateTo(1)}>Hoạt động</Button>
            </Col>
            <Col span={6}>
                <Button style={{width: "100%"}} onClick={() => navigateTo(2)}>Khen thưởng</Button>
            </Col>
            <Col span={6}>
                <Button style={{width: "100%"}} onClick={() => navigateTo(3)}>Vi phạm</Button>
            </Col>
            <Col span={6}>
                <Button style={{width: "100%"}} onClick={() => navigateTo(4)}>Điểm</Button>
            </Col>
        </Row>
    );
}

export default ActivityType;