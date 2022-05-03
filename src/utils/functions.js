import moment from "moment";

export function excelDateToJSDate(excelDate) {
    var date = new Date(Math.round((excelDate - (25567 + 1)) * 86400 * 1000));
    //var converted_date = date.toISOString().split('T')[0];
    return date;
}

export function formatDate(ISODate) {
    if (ISODate) return moment(ISODate.slice(0, -1)).format("DD/MM/YYYY");
    return '';
}