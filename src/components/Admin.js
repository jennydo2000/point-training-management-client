import {Col, Layout, Menu, Row, Slider, Typography} from "antd";
import {Content, Footer, Header} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import {useNavigate, Routes, Route} from "react-router-dom";
import User from "./User";
import Department from "./Department";
import Major from "./Major";
import Class from "./Class";
import Student from "./Student";
import Year from "./Year";
import Semester from "./Semester";
import Activity from "./Activity";
import Test from "./Test";
import Sheet from "./Sheet";
import Attendance from "./Attendance";
import TitleActivity from "./TitleActivity";
import StudentPoint from "./StudentPoint";
import Point from "./Point";
import {BarsOutlined, BookFilled, UserOutlined} from "@ant-design/icons";
import "./Admin.css";
import ActivityType from "./ActivityType";

function Admin() {
    const navigate = useNavigate();

    const handleClickMenu = (e) => {
        navigate(e.key);
    }

    return (
        <Layout className="root">
            <Sider>
                <Menu
                    defaultSelectedKeys={['/users']}
                    onClick={handleClickMenu}
                >
                    <Menu.Item key="/users" icon={<UserOutlined/>}>Tài khoản</Menu.Item>
                    <Menu.Item key="/departments" icon={<UserOutlined/>}>Sinh viên</Menu.Item>
                    <Menu.Item key="/years" icon={<BarsOutlined/>}>Hoạt động từng học kỳ</Menu.Item>
                    <Menu.Item key="/activities" icon={<BarsOutlined/>}>Hoạt động thường niên</Menu.Item>
                    <Menu.Item key="/sheets" icon={<BookFilled/>}>Phiếu điểm</Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header>Header</Header>
                <Content className="main">
                    <Routes>
                        <Route path="/users"element={<User/>}/>
                        <Route path="/departments"element={<Department/>}/>
                        <Route path="/majors"element={<Major/>}/>
                        <Route path="/classes"element={<Class/>}/>
                        <Route path="/students"element={<Student/>}/>
                        <Route path="/years"element={<Year/>}/>
                        <Route path="/semesters"element={<Semester/>}/>
                        <Route path="/activity_types"element={<ActivityType/>}/>
                        <Route path="/activities"element={<Activity/>}/>
                        <Route path="/attendance"element={<Attendance/>}/>
                        <Route path="/sheets"element={<Sheet/>}/>
                        <Route path="/title_activities"element={<TitleActivity/>}/>
                        <Route path="/point"element={<StudentPoint/>}/>
                        <Route path="/points"element={<Point/>}/>
                        <Route path="/test"element={<Test/>}/>
                    </Routes>
                </Content>
                <Typography style={{textAlign: "center", marginTop: 10, marginBottom: 10}}>@2022 Hệ thống quản lý điểm rèn luyện sinh viên tại UDCK</Typography>
            </Layout>
        </Layout>
    );
}

export default Admin;