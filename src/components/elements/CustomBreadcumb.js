import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { useNavigate } from "react-router-dom";

function CustomBreadcrumb(props) {
    const navigate = useNavigate();

    const navigateTo = (e, path) => {
        e.preventDefault();
        navigate(path);
    }

    return (
        <Breadcrumb>
            <Breadcrumb.Item href="" onClick={(e) => navigateTo(e, "/")}>
                <HomeOutlined />
            </Breadcrumb.Item>
            {props.routes.map((route, index) => 
                <Breadcrumb.Item key={index} href="" onClick={(e) => navigateTo(e, route.path)}>{route.name}</Breadcrumb.Item>
            )}
        </Breadcrumb>
    );
}

CustomBreadcrumb.defaultProps = {
    routes: [],
};

export default CustomBreadcrumb;
