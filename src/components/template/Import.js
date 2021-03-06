import {useEffect, useState} from "react";
import {Button, Input, Space, Table, Tooltip, Typography, Upload} from "antd";
import Dragger from "antd/es/upload/Dragger";
import {InboxOutlined} from "@ant-design/icons";
import {read} from "xlsx";
import Text from "antd/es/typography/Text";
import "./Import.css";

const steps = {
    IMPORT: 0,
    PREVIEW: 1,
}

const getRow = (worksheet) => {
    let dropRows = [];
    let startRow = 1;
    while (!Number.isInteger(worksheet[`A${startRow}`]?.v)) startRow++;
    let endRow = startRow;
    while (true) {
        if (!Number.isInteger(worksheet[`A${endRow}`]?.v) && !Number.isInteger(worksheet[`A${endRow + 1}`]?.v)) break;
        if (!Number.isInteger(worksheet[`A${endRow}`]?.v)) dropRows.push(endRow);
        endRow++;
    }
    return {start: startRow, end: endRow - 1, drop: dropRows};
}

function Import(props) {
    const [step, setStep] = useState(steps.IMPORT);
    const [workbook, setWorkbook] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (step === steps.PREVIEW) previewFile();
    }, [props.errors]);

    const importFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const loadedWorkbook = read(e.target.result, {type: "binary"});
            setWorkbook(loadedWorkbook);
        }

        reader.readAsBinaryString(file);
    }

    const previewFile = () => {
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rowDetection = getRow(worksheet);

        const rawRows = [];
        const rows = [];
        for (let index = rowDetection.start; index <= rowDetection.end; index++) {
            const rawRow = {};
            const row = {};
            for (const column of props.columns) {
                let value = column.columnIndex && worksheet[`${column.columnIndex}${index}`]?.v;
                rawRow[column.key] = value;
                if (column.convert) {
                    if (typeof column.convert === "function")
                       value = column.convert(value);
                    else value = props.options[column.convert].find(option => option.name === value)?.id;
                }
                column.render = (text, record, index) => (
                    <>
                        <Typography>{text}</Typography>
                        {props.errors.map((error, i) => error.key === column.key && error.index === index && <Typography><Text key={i} type="danger" italic>{error.message}</Text></Typography>)}
                    </>
                )
                row[column.key] = value;
            }
            rawRows.push(rawRow);
            rows.push(row);
        }

        setRawData(rawRows);
        setData(rows);
        setStep(steps.PREVIEW);
    }

    const insertFile = () => {
        props.onImport(data);
    }

    if (step === steps.IMPORT)
        return (
            <Space direction="vertical" style={{width: "100%", alignItems: "center"}}>
                <Dragger
                    beforeUpload={(file) => {
                        importFile(file);
                        return false;
                    }}
                    maxCount={1}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Ch???n ho???c k??o file v??o khung nh???p</p>
                </Dragger>
                <Button type="primary" onClick={previewFile}>Xem tr?????c</Button>
            </Space>
        );
    else if (step === steps.PREVIEW) {
        const columns = [
            {
                title: "STT",
                width: 70,
                render: (text, record, index) => index + 1,
            },
            ...props.columns,
        ];
        return (
            <Space direction="vertical" style={{width: "100%", flexGrow: 1, alignItems: "center"}}>
                <Table pagination={false} sticky columns={columns.filter(column => !column.hidden)} dataSource={rawData} scroll={{y: 'calc(100vh - 320px)'}}/>
                <Button type="primary" onClick={insertFile}>Nh???p</Button>
                <Button onClick={() => setStep(steps.IMPORT)}>Quay l???i</Button>
            </Space>
        );
    }
    else return (<>B?????c n??y kh??ng c??!</>);
}

export default Import;

Import.defaultProps = {
    columns: [],
    errors: [],
    options: [],
    onImport: () => {},
}