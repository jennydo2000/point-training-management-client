import {DatePicker, Form, Input, Space} from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const weekFormat = 'MM/DD';
const monthFormat = 'YYYY/MM';

const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY'];

const customFormat = value => `custom format: ${value.format(dateFormat)}`;

const customWeekStartEndFormat = value =>
    `${moment(value).startOf('week').format(weekFormat)} ~ ${moment(value)
        .endOf('week')
        .format(weekFormat)}`;

export default () => (
    <Space direction="vertical" size={12}>
        <Form.Item>
                <DatePicker defaultValue={moment('2015/01/01', dateFormat)} format={dateFormat} />
        </Form.Item>
        <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />
        <DatePicker defaultValue={moment('2015/01', monthFormat)} format={monthFormat} picker="month" />
        <DatePicker defaultValue={moment()} format={customWeekStartEndFormat} picker="week" />
        <RangePicker
            defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
            format={dateFormat}
        />
        <DatePicker defaultValue={moment('2015/01/01', dateFormat)} format={customFormat} />
    </Space>
);