import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useForm} from "antd/es/form/Form";
import request from "../utils/request";
import {Button, Form, Input, Modal, Select, Space, Table, Typography} from "antd";
import {DeleteFilled} from "@ant-design/icons";

export const convertTitles = (primaryTitles) => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const convertedData = [];
    primaryTitles.forEach((primaryTitle, index) => {
        primaryTitle.type = "primary";
        primaryTitle.title = `${index+1}. ${primaryTitle.title}`;
        convertedData.push(primaryTitle);
        primaryTitle.secondary_titles.forEach((secondaryTitle, index) => {
            secondaryTitle.title = `${alphabet.charAt(index)}. ${secondaryTitle.title}`;
            secondaryTitle.type = "secondary";
            convertedData.push(secondaryTitle);
            secondaryTitle.third_titles.forEach(thirdTitle => {
                thirdTitle.type = "third";
                convertedData.push(thirdTitle);
            });
            delete secondaryTitle.third_titles;
        });
        delete primaryTitle.secondary_titles;
    });
    return convertedData;
}

function TitleActivity() {
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
            title: "Các hoạt động đánh giá",
            dataIndex: "config",
            key: "config",
            render: (text, record) => {
                if (record.type === "third")
                    return record.title_activities.map(title_activity =>
                        <Typography>[{title_activity.activity.code}] {title_activity.activity.name}</Typography>
                    );
            },
        },
        {
            title: "Hành động",
            dataIndex: "",
            key: "",
            render: (text, record) => {
                if (record.type === "third") return  <Button onClick={() => openThirdTitleActivity(JSON.parse(JSON.stringify(record)))}>Chỉnh sửa</Button>;
            },
        }
    ];
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState({
        data: [],
    });
    const [sheet, setSheet] = useState({});
    const [thirdTitleActivity, setThirdTitleActivity] = useState(null);

    useEffect(async () => {
        const newData = (await getData());
        setSheet(newData.data.sheet);
        const convertedData = convertTitles(newData.data.primaryTitles);
        data.data = convertedData;
        setData({...data});
    }, []);

    const getData = async () => {
        return (await request.get(`/title_activities?sheet=${searchParams.get("sheet")}`)).data;
    }

    const openThirdTitleActivity = (record) => {
        setThirdTitleActivity(record);
    }

    const closeThirdTitleActivity = () => {
        setThirdTitleActivity(null);
    }

    const saveChanges = async () => {
        const preData = {
            title_activities: thirdTitleActivity.title_activities,
            delete: thirdTitleActivity.delete || [],
        }

        const postTitleActivities = (await request.post("/title_activities", preData)).data;
        data.data.forEach((title) => {
            if (title.type === "third" && title.id === thirdTitleActivity.id)
                title.title_activities = postTitleActivities;
        });
        setData(data);
        closeThirdTitleActivity();
    }

    return (
        <>
            <Button onClick={() => navigate(`/points?sheet=${searchParams.get("sheet")}`)}>Xem điểm rèn luyện sinh viên</Button>

            <Table columns={columns} dataSource={data.data} pagination={false} sticky/>

            <Modal
                title="Các tiêu chí đánh giá"
                destroyOnClose
                width={1000}
                visible={Boolean(thirdTitleActivity)}
                onCancel={closeThirdTitleActivity}
                footer={[
                    <Button onClick={closeThirdTitleActivity}>Đóng</Button>,
                    <Button type="primary" onClick={saveChanges}>Lưu thay đổi</Button>,
                ]}
            >
                <ThirdTitleActivity title={thirdTitleActivity} sheet={sheet}/>
            </Modal>
        </>
    );
}

const ThirdTitleActivity = (props) => {
    const defaultTitleActivity = {
        third_title_id: null,
        activity_id: null,
        sheet_id: null,
        point: [],
        options: [],
    }
    const [title, setTitle] = useState(props.title);
    const [activityModal, setActivityModal] = useState(null);
    const [activities, setActivities] = useState({
        data: [],
    });
    const [titleActivityIndex, setTitleActivityIndex] = useState(-1);
    const [form] = useForm();

    if (!title.type === "third") return;

    const columns = [
        {
            title: "Mã hoạt động",
            dataIndex: ["activity", "code"],
            key: "code",
        },
        {
            title: "Tên hoạt động",
            dataIndex: ["activity", "name"],
            key: "name",
        },
        {
            title: "Tùy chỉnh tính điểm",
            dataIndex: "point",
            key: "point",
            render: (text, record) => <TitleActivityItem title={record}/>,
        },
        {
            title: "Hành động",
            dataIndex: '',
            key: "action",
            render: (text, record, index) =>
                <>
                    <Button
                        danger
                        onClick={() => {
                            openDeleteActivity(index);
                        }}
                        icon={<DeleteFilled/>}
                    />
                </>
        },
    ];

    const openAddActivity = async () => {
        setActivityModal("CREATE");
        setActivities(await getActivities());
    }

    const closeAddActivity = () => {
        setActivityModal(null);
    }

    const openDeleteActivity = () => {
        setActivityModal("DELETE");
    }

    const closeDeleteActivity = () => {
        setActivityModal(null);
        setTitleActivityIndex(-1);
    }

    const getActivities = async () => {
        return (await request.get(`/activities?semester=${props.sheet.semester_id}&type=all`)).data;
    }

    const addTitleActivity = (activityIndex) => {
        const newTitleActivity = defaultTitleActivity;
        newTitleActivity.activity = activities.data[activityIndex];
        newTitleActivity.activity_id = newTitleActivity.activity.id;
        newTitleActivity.third_title_id = title.id;
        newTitleActivity.sheet_id = props.sheet.id;
        title.title_activities.push(newTitleActivity);
        title.title_activities = [...title.title_activities];
        setTitle({...title});
        closeAddActivity();
    }

    const deleteTitleActivity = () => {
        const titleActivity = title.title_activities.splice(titleActivityIndex, 1)[0];
        title.title_activities = [...title.title_activities];
        if (!title.delete) title.delete = [];
        if (titleActivity.id) title.delete.push(titleActivity.id);
        setTitle({...title});
        closeDeleteActivity();
    }

    return (
        <>
            <Table columns={columns} dataSource={title.title_activities} pagination={false}/>
            <Space align="center" style={{width: "100%"}} direction="vertical">
                <Button type="primary" onClick={() => openAddActivity()}>Thêm hoạt động</Button>
            </Space>

            <Modal
                title="Thêm hoạt động"
                destroyOnClose
                visible={Boolean(activityModal === "CREATE")}
                onCancel={closeAddActivity}
                footer={[
                    <Button onClick={closeAddActivity}>Đóng</Button>,
                    <Button type="primary" onClick={form.submit}>Thêm</Button>,
                ]}
            >
                {activityModal === "CREATE" &&
                    <Form
                        form={form}
                        labelCol={{span: 6}}
                        wrapperCol={{span: 18}}
                        onFinish={(values) => addTitleActivity(values.activity_index)}
                    >
                        <Form.Item
                            label="Hoạt động"
                            name="activity_index"
                        >
                            <Select
                                style={{width: "100%"}}
                                filterOption={false}
                                defaultValue={-1}
                            >
                                <Select.Option value={-1}>Chọn hoạt động...</Select.Option>
                                {activities.data.map((activity, index) =>
                                    <Select.Option
                                        key={index}
                                        value={index}
                                    >
                                        [{activity.code}]: {activity.name}
                                    </Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Form>
                }
            </Modal>

            <Modal
                title="Xóa hoạt động"
                destroyOnClose
                visible={Boolean(activityModal === "DELETE")}
                onCancel={closeDeleteActivity}
                footer={[
                    <Button onClick={closeAddActivity}>Đóng</Button>,
                    <Button danger type="primary" onClick={deleteTitleActivity}>Xóa</Button>,
                ]}
            >
                Xác nhận xóa
            </Modal>
        </>
    );
}

const TitleActivityItem = (props) => {
    const render = [];

    const [title, setTitle] = useState(props.title);

    const addCondition = () => {
        title.options.push({
            type: "eq",
            value: "",
            point: "",
        });
        setTitle({...title});
    }

    const changeCondition = (index, key, value) => {
        title.options[index][key] = value;
        setTitle(key === "type" ? {...title} : title);
    }

    const changePoint = (index, value) => {
        title.point[index] = value;
        setTitle(title);
    }

    const deleteCondition = (index) => {
        title.options.splice(index, 1);
        setTitle({...title});
    }

    if (title.activity.type === "ENUM") {
        render.push(
            props.title.activity.accepts.map((accept, index) =>
                <Form.Item label={accept}>
                    <Input
                        type="number"
                        style={{width: "100px"}}
                        defaultValue={props.title.point[index] || 0}
                        onChange={(e) => changePoint(index, e.target.value)}
                    />
                </Form.Item>
            )
        );
    } else render.push(
        <div> Điểm{" "}
            <Input
                style={{width: "100px"}}
                defaultValue={props.title.point}
                onChange={(e) => changePoint(0, e.target.value)}
            />
        </div>
    );

    render.push(
        title.options?.map((option, index) => (
            <div>
                Nếu số lần{" "}
                <Select
                    value={option.type}
                    style={{width: "150px"}}
                    onChange={(value) => changeCondition(index, "type", value)}
                >
                    {[
                        {id: "eq", name: "Bằng"},
                        {id: "gt", name: "Lớn hơn"},
                        {id: "lt", name: "Nhỏ hơn"},
                        {id: "gte", name: "Lớn hơn hoặc bằng"},
                        {id: "lte", name: "Nhỏ hơn hoặc bằng"},
                    ].map((item, index) => <Select.Option key={index} value={item.id}>{item.name}</Select.Option>)}
                </Select>
                {" "}
                <Input
                    style={{width: "60px"}}
                    defaultValue={option.value}
                    onChange={(e) => changeCondition(index, "value", e.target.value)}
                />
                thì thay bằng
                <Input
                    style={{width: "60px"}}
                    defaultValue={option.point}
                    onChange={(e) => changeCondition(index, "point", e.target.value)}
                />
                {" "}
                <Button
                    danger
                    icon={<DeleteFilled/>}
                    onClick={() => deleteCondition(index)}
                />
            </div>
        ))
    );

    if (title.activity.type === "COUNT")
        render.push(
            <Button
                onClick={addCondition}
            >
                Thêm điều kiện
            </Button>
        );

    return <Space direction="vertical">{render}</Space>;
}

export default TitleActivity;