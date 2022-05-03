import {useEffect, useState} from "react";
import request from "../../utils/request";
import List from "./List";
import {Button, Input, Modal, Space} from "antd";
import Form from "./Form";
import Title from "antd/es/typography/Title";
import {FileAddFilled, PlusOutlined, UndoOutlined} from "@ant-design/icons";
import Import from "./Import";

const modalType = {
    CREATE: 0,
    EDIT: 1,
    DELETE: 2,
    IMPORT: 3,
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
    const [importErrors, setImportErrors] = useState([]);

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
        setImportErrors([]);
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

    const handleImport = async (rows) => {
        await request.post(`${props.route}/import`, rows)
            .then(res => {
                data.data = [ ...res.data.reverse(), ...data.data];
                setData(data);
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

    return (
        <>
            <Space direction="vertical" style={{width: "100%", alignItems: "center", marginBottom: 10}}>
                <Title style={{textAlign: "center", marginBottom: 0}}>{props.name}</Title>
                <Space>
                    <Button onClick={() => setShowModal(modalType.CREATE)} icon={<PlusOutlined/>}>Thêm mới</Button>
                    {props.importColumns && props.importColumns.length > 0 && <Button onClick={() => setShowModal(modalType.IMPORT)} icon={<FileAddFilled/>}>Nhập danh sách</Button>}
                    {props.buttons}
                </Space>
                <div style={{display: "flex", alignItems: "center"}}>
                    <Input.Search
                        value={keyword}
                        placeholder="Tìm kiếm..."
                        style={{width: 200}}
                        onChange={(e) => setKeyword(e.target.value)}
                        onSearch={search}
                    />
                    {keyword && <Button icon={<UndoOutlined/>} onClick={clearSearch}/>}
                </div>
            </Space>

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
                centered
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
                centered
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
                centered
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
                Nhấn nút xóa để xác nhận xóa
            </Modal>

            <Modal
                title={`Nhập ${props.name}`}
                width={"100vw"}
                destroyOnClose
                centered
                visible={showModal === modalType.IMPORT}
                onCancel={close}
                footer={[
                    <Button
                        key="back"
                        onClick={close}
                    >
                        Đóng
                    </Button>

                ]}
            >
                <Import options={options} errors={importErrors} columns={props.importColumns} onInsert={handleImport}/>
            </Modal>
        </>
    );
}

Index.defaultProps = {
    route: "",
    name: "",
    buttons: [],
    columns: [],
    importColumns: [],
    preCreate: () => {},
    preUpdate: () => {},
    createForm: [],
    updateForm: [],
}

export default Index;