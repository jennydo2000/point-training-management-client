import {Button, DatePicker, Form as FormComp, Input, Select, Space} from "antd";
import moment from 'moment';
import {useState} from "react";

function Form(props) {
    const {initialValues, errors, form, options} = props;
    const [formInstance] = FormComp.useForm();
    const [values, setValues] = useState(initialValues);

    const getValue = (input, args = []) => {
        if (!Array.isArray(args)) args = [args];
        if (!input) return null;
        if (typeof input === "function") return input(input, ...args);
        else return input;
    }

    return (
        <FormComp
            form={formInstance}
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            onFinish={props.onFinish}
            onValuesChange={(newValues) => setValues({...values, ...newValues})}
        >
            {form.map((item, index) =>
                (!Boolean(item.hide) || !item.hide(values)) &&
                <FormComp.Item
                    key={index}
                    label={item.label}
                    style={item.type === "hidden" ? {display: "none"} : {}}
                    name={item.name}
                    initialValue={(() => {
                        let initialValue = initialValues[item.name] || item.initialValue;
                        if (item.type === "date" && initialValue)
                            initialValue = moment(initialValue, "YYYY/MM/DD");
                        return initialValue;
                    })()}
                    validateStatus={Boolean(getValue(item.error, values) || errors[item.name]) ? "error" : "validating"}
                    help={getValue(item.error, values) || errors[item.name]}
                >
                    {item.type === "select" ?
                        <Select disabled={item.disabled === true}>
                            {(Array.isArray(item.options) ? getValue(item.options, values) : options[item.options])?.map((option, index) =>
                                <Select.Option key={index} value={option.id}>
                                    {getValue(item.labelOption, option) || option.name}
                                </Select.Option>
                            )}
                        </Select>
                        : item.type === "date" ?
                            <DatePicker disabled={item.disabled === true} format="DD/MM/YYYY"/>
                        : (item.component || <Input disabled={item.disabled === true} type={item.type || "text"}/>)
                    }
                </FormComp.Item>
            )}
            <Space align="center" direction="vertical" style={{width: "100%"}}>
                <Button type="primary" htmlType="submit">Thêm</Button>
            </Space>
        </FormComp>
    );
}

Form.defaultProps = {
    initialValues: {},
    form: [],
    errors: {},
    onFinish: () => {},
}

export default Form;