import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import request from "../utils/request";
import {Button, Form, Input, Modal, PageHeader, Select, Space, Table, Typography} from "antd";
import {DeleteFilled, MinusOutlined} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import FullHeightTable from "./elements/FullHeightTable";
import {getActivityTypeAction} from "./Activity";
import {useForm} from "antd/lib/form/Form";
import CustomBreadcrumb from "./elements/CustomBreadcumb";

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
            width: 120,
        },
        {
            title: "Điểm mặc định",
            dataIndex: "default_point",
            key: "default_point",
            width: 130,
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
            width: 150,
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
    const [sheet, setSheet] = useState({semester: {year: {}}});
    const [thirdTitleActivity, setThirdTitleActivity] = useState(null);

    useEffect(async () => {
        const newData = (await getData());
        setSheet(await getSheet());
        const convertedData = convertTitles(newData.data.primaryTitles);
        data.data = convertedData;
        setData({...data});
    }, []);

    const getData = async () => {
        return (await request.get(`/title_activities?sheet=${searchParams.get("sheet")}`)).data;
    }

    const getSheet = async () => {
        return (await request.get(`/sheets/${searchParams.get("sheet")}`)).data;
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
            <PageHeader
                style={{width: "100%", backgroundColor: "white", marginBottom: 10}}
                title="Cấu hình phiếu điểm"
                breadcrumb={
                    <CustomBreadcrumb routes={[
                        {name: "Quản lý hoạt động", path: "/years"},
                        {name: `Năm học ${sheet.semester.year.name}`, path: `/semesters?year=${sheet.semester.year.id}`},
                        {name: `Học kỳ ${sheet.semester.name}`, path: `/activity_types?semester=${sheet.semester.id}`},
                        {name: "Phiếu điểm", path: `/sheets?semester=${sheet.semester.id}`},
                        {name: `${sheet.name}`, path: `/points?sheet=${sheet.id}`},
                        {name: `Cấu hình phiếu điểm`, path: `/title_activities?sheet=${sheet.id}`},
                    ]} />
                }
            />

            <FullHeightTable
                columns={columns}
                dataSource={data.data}
                pagination={false}
                sticky
            />

            <Modal
                title="Các tiêu chí đánh giá"
                destroyOnClose
                centered
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
    const [keyword, setKeyword] = useState('');
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
            title: "Điểm",
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
        setKeyword('');
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

    const addTitleActivity = (activityId) => {
        const newTitleActivity = defaultTitleActivity;
        newTitleActivity.activity = activities.data.find(activity => activity.id === activityId);
        newTitleActivity.activity_id = newTitleActivity.activity.id;
        newTitleActivity.third_title_id = title.id;
        newTitleActivity.sheet_id = props.sheet.id;
        title.title_activities.push(newTitleActivity);
        props.title.title_activities = title.title_activities = [...title.title_activities];
        setTitle({...title});
        closeAddActivity();
    }

    const deleteTitleActivity = () => {
        const titleActivity = title.title_activities.splice(titleActivityIndex, 1)[0];
        title.title_activities = [...title.title_activities];
        props.title.title_activities = [...title.title_activities];
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
                centered
                visible={Boolean(activityModal === "CREATE")}
                onCancel={closeAddActivity}
                footer={[
                    <Button onClick={closeAddActivity}>Đóng</Button>,
                    <Button type="primary" onClick={form.submit}>Thêm</Button>,
                ]}
            >
                {activityModal === "CREATE" &&
                    <>
                        <Form
                            form={form}
                            labelCol={{span: 6}}
                            wrapperCol={{span: 18}}
                            onFinish={(values) => addTitleActivity(values.activity_id)}
                        >
                            <Form.Item
                                label="Hoạt động"
                                name="activity_id"
                            >
                                <Select
                                    showSearch
                                    onKeyDown={(e) => setKeyword(e.target.value)}
                                    style={{width: "100%"}}
                                    filterOption={false}
                                    defaultValue={-1}
                                >
                                    <Select.Option value={-1}>Chọn hoạt động...</Select.Option>
                                    {activities.data.filter(item => keyword === '' || item.name.toLowerCase().includes(keyword.toLowerCase())).map((activity, index) =>
                                        <Select.Option
                                            key={index}
                                            value={activity.id}
                                        >
                                            [{activity.code}]: {activity.name}
                                        </Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Form>
                    </>
                }
            </Modal>

            <Modal
                title="Xóa hoạt động"
                destroyOnClose
                centered
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
                <Space style={{whiteSpace: "nowrap"}}>
                    {accept}
                    <Input
                        type="number"
                        style={{width: "65px"}}
                        defaultValue={props.title.point[index] || 0}
                        onChange={(e) => changePoint(index, e.target.value)}
                    /> điểm.
                </Space>
            )
        );
    } else if (title.activity.type === "COUNT" || title.activity.type === "POINT") {
        if (title.activity.type === "COUNT") {
            render.push(
                <Space style={{whiteSpace: "nowrap"}}>
                    <span>Mỗi lần {getActivityTypeAction(title.activity.activity_type_id)}</span>
                    <Input
                        type="number"
                        style={{width: "65px"}}
                        defaultValue={props.title.point}
                        onChange={(e) => changePoint(0, e.target.value)}
                    /> điểm.
                </Space>
            );
        }

        render.push(
            title.options?.map((option, index) => (
                <Space size="small" style={{whiteSpace: "nowrap"}}>
                    <Button
                        size="small"
                        danger
                        icon={<MinusOutlined/>}
                        onClick={() => deleteCondition(index)}
                    />
                    {title.activity.type === "COUNT" ? "Nếu số lần" : "Nếu đạt điểm"}
                    <Select
                        value={option.type}
                        style={{width: "65px"}}
                        onChange={(value) => changeCondition(index, "type", value)}
                    >
                        {[
                            {id: "eq", name: "="},
                            {id: "gt", name: ">"},
                            {id: "lt", name: "<"},
                            {id: "gte", name: ">="},
                            {id: "lte", name: "<="},
                        ].map((item, index) => <Select.Option key={index} value={item.id}>{item.name}</Select.Option>)}
                    </Select>
                    <Input
                        type="number"
                        style={{width: "65px"}}
                        defaultValue={option.value}
                        onChange={(e) => changeCondition(index, "value", e.target.value)}
                    />
                    {title.activity.type === "COUNT" ? "thì thay bằng" : "thì chấm"}
                    <Input
                        type="number"
                        style={{width: "65px"}}
                        defaultValue={option.point}
                        onChange={(e) => changeCondition(index, "point", e.target.value)}
                    /> điểm.
                </Space>
            ))
        );

        render.push(
            <Button
                onClick={addCondition}
            >
                Thêm điều kiện
            </Button>
        );
    } else if (title.activity.type === "CHECK") {
        render.push(
            <Space direction="vertical" style={{whiteSpace: "nowrap"}}>
                <Space>
                    <span>Có {getActivityTypeAction(title.activity.activity_type_id)}</span>
                    <Input
                        type="number"
                        style={{width: "70px"}}
                        defaultValue={props.title.point[1] || 0}
                        onChange={(e) => changePoint(1, e.target.value)}
                    /> điểm.
                </Space>
                <Space>
                    <span>Không {getActivityTypeAction(title.activity.activity_type_id)}</span>
                    <Input
                        type="number"
                        style={{width: "70px"}}
                        defaultValue={props.title.point[0] || 0}
                        onChange={(e) => changePoint(0, e.target.value)}
                    /> điểm.
                </Space>
            </Space>
        );
    }

    return <Space direction="vertical">{render}</Space>;
}

export default TitleActivity;
