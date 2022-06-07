import {useEffect, useState} from "react";
import request from "../../utils/request";
import List from "./List";
import {Button, Input, Modal, PageHeader, Space} from "antd";
import Form from "./Form";
import {FileAddFilled, PlusOutlined, UndoOutlined} from "@ant-design/icons";
import Import from "./Import";
import CustomBreadcrumb from "../elements/CustomBreadcumb";

const modalType = {
    CREATE: 0,
    EDIT: 1,
    DELETE: 2,
    IMPORT: 3,
    COPY: 4,
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

    const handleCopy = async (index, values) => {

        await request.post(`${props.route}/${data.data[index].id}/copy`, values)
            .then(async res => {
                data.data.unshift(res.data);
                setData(JSON.parse(JSON.stringify(data)));
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
            <PageHeader
                style={{width: "100%", backgroundColor: "white", marginBottom: 10}}
                title={props.name}
                breadcrumb={
                    <CustomBreadcrumb routes={props.routes} />
                }
                extra={
                    <>
                        <Button onClick={() => setShowModal(modalType.CREATE)} icon={<PlusOutlined/>}>Thêm mới</Button>
                        {props.importColumns && props.importColumns.length > 0 && <Button onClick={() => setShowModal(modalType.IMPORT)} icon={<FileAddFilled/>}>Nhập danh sách</Button>}
                        {props.buttons}
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
                    </>
                }
            />

            <List
                data={data.data}
                columns={props.columns}
                canCopy={Boolean(props.copyForm)}
                canUpdate={Boolean(props.updateForm)}
                canCreate={Boolean(props.createForm)}
                canDelete={true}
                onUpdate={(record, index) => {
                    setDataIndex(index);
                    setShowModal(modalType.EDIT);
                }}
                buttons={props.listButtons}
                onDelete={(record, index) => {
                    setDataIndex(index);
                    setShowModal(modalType.DELETE);
                }}
                onCopy={(record, index) => {
                    setDataIndex(index);
                    setShowModal(modalType.COPY);
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
                {showModal === modalType.CREATE && <Form form={props.createForm || []} options={options} errors={errors} onFinish={handleCreate}/>}
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
                {showModal !== null && dataIndex !== -1 && <Form form={props.updateForm || []} options={options} errors={errors} initialValues={data.data[dataIndex]} onFinish={handleUpdate} />}
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
                <Import options={options} errors={importErrors} columns={props.importColumns || []} onInsert={handleImport}/>
            </Modal>

            <Modal
                title={`Sao chép ${props.name}`}
                destroyOnClose
                centered
                visible={showModal === modalType.COPY}
                onCancel={close}
                footer={[
                    <Button
                        key="back"
                        onClick={close}
                    >
                        Đóng
                    </Button>,

                ]}
            >
                <Form
                    form={props.copyForm || []}
                    options={options}
                    errors={errors}
                    initialValues={data.data[dataIndex]}
                    onFinish={values => handleCopy(dataIndex, values)}
                />
            </Modal>
        </>
    );
}

Index.defaultProps = {
    route: "",
    name: "",
    buttons: [],
    listButtons: [],
    columns: [],
    importColumns: [],
    routes: [],
    preCreate: () => {},
    preUpdate: () => {},
    createForm: null,
    updateForm: null,
    copyForm: null,
}

export default Index;