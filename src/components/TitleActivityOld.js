import {Button, Form, Input, Modal, Select, Space, Table, Typography} from "antd";
import {useEffect, useState} from "react";
import request from "../utils/request";
import {useSearchParams} from "react-router-dom";
import {useForm} from "antd/lib/form/Form";
import {DeleteFilled, DeleteOutlined, UploadOutlined} from "@ant-design/icons";

function TitleActivityOld() {
    const columns = [
        {
            title: "Tiêu chí đánh giá",
            dataIndex: "title",
            key: "title",
            render: (text, record) => record.type === "primary" ? <b>{text.toUpperCase()}</b> : record.type === "secondary" ? <b>{text}</b> : text,
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
            render: (text, record) => record.type === "third" ? record.title_activities.map(title_activity => <Typography>[{title_activity.activity.code}] {title_activity.activity.name}</Typography>) : "",
        },
        {
            title: "Hành động",
            dataIndex: "",
            key: "",
            render: (text, record) => record.type === "third" ? <Button onClick={() => open(record)}>Chỉnh sửa</Button> : "",
        }
    ];

    const [searchParams] = useSearchParams();
    const defaultTitleActivity = {
        third_title_id: null,
            activity_id: null,
        sheet_id: searchParams.get("sheet"),
        point: [],
        options: [],
    }
    const [data, setData] = useState({data: []});
    const [thirdTitleActivity, setThirdTitleActivity] = useState(null);
    const [titleActivity, setTitleActivity] = useState(null);
    const [activities, setActivities] = useState({});
    const [activity, setActivity] = useState(null);
    const [showConfig, setShowConfig] = useState(false);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [showDeleteActivity, setShowDeleteActivity] = useState(false);
    const [form] = useForm();
    const [newTitleActivity, setNewTitleActivity] = useState(defaultTitleActivity);

    useEffect(async () => {
        setActivities((await getActivities()).data);
        const newData = (await getData()).data;
        const convertedData = convertData(newData.data);
        data.data = convertedData;
        setData({...data});
    }, []);

    const getData = async () => {
        return await request.get(`/title_activities?sheet=${searchParams.get("sheet")}`);
    }

    const getActivities = async () => {
        return await request.get(`/activities?semester=1`);
    }

    const convertData = (data) => {
        const {primaryTitles, titleActivities} = data;
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
                    thirdTitle.title_activities = titleActivities.filter(activityTitle => activityTitle.third_title_id === thirdTitle.id);
                    convertedData.push(thirdTitle);
                });
            });
        });
        console.log(convertedData);
        return convertedData;
    }

    const open = (record) => {
        setShowConfig(true);
        setThirdTitleActivity(record);
    }

    const close = () => {
        setShowConfig(false);
        setShowAddActivity(false);
        setThirdTitleActivity(null);
        setActivity(null);
        setNewTitleActivity(defaultTitleActivity);
    }

    const closeAddActivity = () => {
        setShowAddActivity(false);
        setNewTitleActivity(defaultTitleActivity);
    }

    const closeDeleteActivity = () => {
        setShowDeleteActivity(false);
    }

    const addCondition = () => {
        newTitleActivity.options.push({
            type: "eq",
            value: "",
            point: "",
        });
        setNewTitleActivity({...newTitleActivity});
    }

    const changeCondition = (index, key, value) => {
        newTitleActivity.options[index][key] = value;
        setNewTitleActivity(key === "type" ? {...newTitleActivity} : newTitleActivity);
    }

    const deleteCondition = (index) => {
        newTitleActivity.options.splice(index, 1);
        setNewTitleActivity({...newTitleActivity});
    }

    const changePoint = (index, value) => {
        newTitleActivity.point[index] = value;
        console.log(newTitleActivity);
        setNewTitleActivity(newTitleActivity);
    }

    const addActivity = async (thirdTitleActivity, values) => {
        newTitleActivity.activity_id = activity.id;
        newTitleActivity.third_title_id = thirdTitleActivity.id;
        console.log(newTitleActivity);
        const response = (await request.post("/title_activities", newTitleActivity)).data;
        thirdTitleActivity.title_activities.push(response);
        console.log(thirdTitleActivity);
        setData({...data});
        closeAddActivity();
    }

    const deleteActivity = async () => {
        const response = await request.delete(`title_activities/${titleActivity.id}`);
        const index = thirdTitleActivity.title_activities.findIndex(title_activity => title_activity.id === titleActivity.id);
        thirdTitleActivity.title_activities.splice(index, 1);
        setData({...data});
        closeDeleteActivity();
    }

    const Config = (props) => {
        if (props.record.type === "third") {
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
                    title: "Điểm",
                    dataIndex: "point",
                    key: "point",
                    render: (text, record) => {
                        if (record.activity.type === "ENUM")
                            return record.activity.accepts.map((accept, index) =>
                                <Form.Item label={accept}>
                                    <Input type="number" style={{width: "100px"}} defaultValue={record.point[index]}/>
                                </Form.Item>
                            );
                        return <Input defaultValue={record.point}/>;
                    },
                },
                {
                    title: "Hành động",
                    dataIndex: '',
                    key: "action",
                    render: (text, record) =>
                        <>
                            <Button
                                danger
                                onClick={() => {
                                    setShowDeleteActivity(true);
                                    setTitleActivity(record);
                                }}
                                icon={<DeleteFilled/>}
                            />
                        </>
                },
            ];

            return (
                <>
                    <Table columns={columns} dataSource={props.record.title_activities} pagination={false}/>
                    <Space align="center" style={{width: "100%"}} direction="vertical">
                        <Button type="primary" onClick={() => setShowAddActivity(true)}>Thêm hoạt động</Button>
                    </Space>
                </>
            )
        }
    }

    const AddActivity = (props) => {
        return (
            <>
                <Typography>Thêm</Typography>
                <Form.Item
                    label="Hoạt động"
                >
                    <Select style={{width: "100%"}} filterOption={false} value={props.activity?.id || -1}
                            onChange={(value, e) => {
                                setActivity(props.activities.data.find(activity => activity.id === value));
                                newTitleActivity.activity_id = value;
                                newTitleActivity.point = [];
                                setNewTitleActivity({...newTitleActivity});
                            }}>
                        <Select.Option value={-1}>Chọn hoạt động...</Select.Option>
                        {props.activities.data.map((activity, index) =>
                            <Select.Option
                                key={index}
                                value={activity.id}
                            >
                                [{activity.code}]: {activity.name}
                            </Select.Option>)}
                    </Select>
                </Form.Item>

                {["CHECK", "COUNT"].includes(props.activity?.type) ?
                    <Form.Item
                        label="Điểm"
                    >
                        <Input type="number" defaultValue={newTitleActivity.point[0]} onChange={(e) => changePoint(0, e.target.value)}/>
                    </Form.Item>
                    : props.activity?.accepts.map((accept, index) =>
                        <Form.Item
                            label={accept}
                        >
                            <Input type="number" defaultValue={newTitleActivity.point[index]} onChange={(e) => changePoint(index, e.target.value)}/>
                        </Form.Item>
                    )
                }

                <Typography>Điều kiện thêm:</Typography>

                {newTitleActivity.options.map((option, index) => (
                    <div>
                        Nếu điểm{" "}
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
                        {" "}<Input style={{width: "60px"}} defaultValue={option.value} onChange={(e) => changeCondition(index, "value", e.target.value)}/>
                        thì thay bằng <Input style={{width: "60px"}} defaultValue={option.point} onChange={(e) => changeCondition(index, "point", e.target.value)}/>
                        {" "}<Button onClick={() => deleteCondition(index)} danger icon={<DeleteFilled/>} />
                    </div>
                ))}
                <Button onClick={addCondition}>Thêm điều kiện</Button>
            </>
        );
    }

    return (
        <>
            <Table columns={columns} dataSource={data.data} pagination={false} sticky/>
            <Modal
                title="Các tiêu chí đánh giá"
                destroyOnClose
                visible={showConfig}
                onCancel={close}
            >
                <Config record={thirdTitleActivity}/>
            </Modal>
            <Modal
                title="Thêm hoạt động"
                destroyOnClose
                visible={showAddActivity}
                onCancel={closeAddActivity}
                footer={[
                    <Button onClick={closeAddActivity}>Đóng</Button>,
                    <Button type="primary" onClick={form.submit}>Thêm</Button>,
                ]}
            >
                {showAddActivity &&
                    <Form
                        form={form}
                        labelCol={{span: 6}}
                        wrapperCol={{span: 18}}
                        onFinish={(values) => addActivity(thirdTitleActivity, values)}
                    >
                        <AddActivity activities={activities} activity={activity} thirdTitleActivity={thirdTitleActivity}/>
                    </Form>
                }
            </Modal>
            <Modal
                title="Xóa hoạt động"
                destroyOnClose
                visible={showDeleteActivity}
                onCancel={closeDeleteActivity}
                footer={[
                    <Button onClick={closeAddActivity}>Đóng</Button>,
                    <Button danger type="primary" onClick={deleteActivity}>Xóa</Button>,
                ]}
            >
                Xác nhận xóa
            </Modal>
        </>
    );
}

export default TitleActivityOld;