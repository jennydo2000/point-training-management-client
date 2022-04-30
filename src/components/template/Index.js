import {useEffect, useRef, useState} from "react";
import request from "../../utils/request";
import List from "./List";
import {Button, Input, Modal} from "antd";
import Form from "./Form";
import Title from "antd/es/typography/Title";
import {UndoOutlined} from "@ant-design/icons";

const modalType = {
    CREATE: 0,
    EDIT: 1,
    DELETE: 2,
}

function Index(props) {
    const [keyword, setKeyword] = useState('');
    const [data, setData] = useState({
        data: [],
    });
    const [dataIndex, setDataIndex] = useState(-1);
    const [showModal, setShowModal] = useState(null);
    const [errors, setErrors] = useState({});
    const [options, setOptions] = useState({});

    useEffect(async () => {
        setData((await getData()).data);
        setOptions((await getOptions()).data);
    }, []);

    const getData = async (search = null) => {
        const url = search ? `&search=${search}` : '';
        return await request.get(`${props.route}?${new URLSearchParams(props.params).toString()}${url}`);
    }

    const getOptions = async () => {
        return await request.get(`${props.route}/create`);
    }

    const search = async (value) => {
        setData((await getData(value)).data);
    }

    const clearSearch = async () => {
        setData((await getData()).data);
        setKeyword('');
    }

    const close = () => {
        setShowModal(null);
        setDataIndex(-1);
        setErrors([]);
    }

    const handleCreate = async (values) => {
        values = props.preCreate(values) || values;
        await request.post(`${props.route}`, values)
            .then(async res => {
                setErrors({});
                data.data.unshift(res.data);
                setData(JSON.parse(JSON.stringify(data)));
                close();
            })
            .catch(reject => {
                const errors = {};
                reject.response.data.errors.forEach(error => !errors[error.param] ? errors[error.param] = error.msg : '');
                setErrors(errors);
            });
    }

    const handleUpdate = async (values) => {
        values = props.preUpdate(values) || values;
        await request.put(`${props.route}/${data.data[dataIndex].id}`, values)
            .then(async res => {
                setErrors({});
                data.data[dataIndex] = res.data;
                setData(JSON.parse(JSON.stringify(data)));
                close();
            })
            .catch(reject => {
                const errors = {};
                reject.response.data.errors.forEach(error => !errors[error.param] ? errors[error.param] = error.msg : '');
                setErrors(errors);
            });
    }

    const handleDelete = async (index) => {
        request.delete(`${props.route}/${data.data[index].id}`)
            .then(res => {
                data.data.splice(index, 1);
                setData(JSON.parse(JSON.stringify(data)));
                close();
            })
            .catch(error => {});
    }

    return (
        <>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10}}>
                <Title style={{textAlign: "center"}}>{props.name}</Title>
                <Button onClick={() => setShowModal(modalType.CREATE)}>Thêm mới</Button>
                <div style={{display: "flex", alignItems: "center", marginTop: 10}}>
                    <Input.Search
                        value={keyword}
                        placeholder="Tìm kiếm..."
                        style={{width: 200}}
                        onChange={(e) => setKeyword(e.target.value)}
                        onSearch={search}
                    />
                    {keyword && <Button icon={<UndoOutlined/>} onClick={clearSearch}/>}
                </div>
            </div>

            <List
                data={data.data}
                columns={props.columns}
                onEdit={(record, index) => {
                    setDataIndex(index);
                    setShowModal(modalType.EDIT);
                }}
                onDelete={(record, index) => {
                    setDataIndex(index);
                    setShowModal(modalType.DELETE);
                }}
            />

            <Modal
                title={`Thêm ${props.name}`}
                destroyOnClose
                visible={showModal === modalType.CREATE}
                onCancel={close}
                footer={
                    <Button key="back" onClick={close}>
                        Đóng
                    </Button>
                }
            >
                {showModal === modalType.CREATE && <Form form={props.createForm} options={options} errors={errors} onFinish={handleCreate}/>}
            </Modal>

            <Modal
                title={`Chỉnh sửa ${props.name}`}
                destroyOnClose
                visible={showModal === modalType.EDIT}
                onCancel={close}
                footer={
                    <Button
                        key="back"
                        onClick={close}
                    >
                        Đóng
                    </Button>
                }
            >
                {showModal !== null && dataIndex !== -1 && <Form form={props.updateForm} options={options} errors={errors} initialValues={data.data[dataIndex]} onFinish={handleUpdate} />}
            </Modal>

            <Modal
                title={`Xóa ${props.name}`}
                destroyOnClose
                visible={showModal === modalType.DELETE}
                onCancel={close}
                footer={[
                    <Button
                        key="back"
                        onClick={close}
                    >
                        Đóng
                    </Button>,
                    <Button
                        key="delete"
                        danger
                        onClick={() => handleDelete(dataIndex)}
                    >
                        Xóa
                    </Button>

                ]}
            >

            </Modal>
        </>
    );
}

Index.defaultProps = {
    route: "",
    name: "",
    columns: [],
    preCreate: () => {},
    preUpdate: () => {},
    createForm: [],
    updateForm: [],
}

export default Index;