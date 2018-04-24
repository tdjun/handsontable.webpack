import 'babel-polyfill';
import Handsontable from 'handsontable';
import 'handsontable.css';
import './hot/autocomplete2/autocomplete2.celltypes.js';

let mydata = [
    { codeId: 'code1', codeId2:'code1-1', num3: 3 },
    { codeId: 'code1', codeId2:'code1-2', num3: 3 },
    { codeId: 'code1', codeId2:'code1-1', num3: 3 },
    { codeId: 'code2', codeId2:'code2-1', num3: 3 },
    { codeId: 'code3', codeId2:'code3-1', num3: 3 },
    { codeId: 'code1', codeId2:'code1-2', num3: 3 }
];
let codeList = [
    {code:'code1', codeNm:'codeNm1'},
    {code:'code2', codeNm:'codeNm2'},
    {code:'code3', codeNm:'codeNm3'},
    {code:'code4', codeNm:'codeNm4'},
    {code:'code5', codeNm:'codeNm5'},
];
let subCodeList = [
    {upperCode: 'code1', code:'code1-1', codeNm:'codeNm1-1'},
    {upperCode: 'code1', code:'code1-2', codeNm:'codeNm1-1'},
    {upperCode: 'code2', code:'code2-1', codeNm:'codeNm2-1'},
    {upperCode: 'code2', code:'code2-2', codeNm:'codeNm2-2'},
    {upperCode: 'code3', code:'code3-1', codeNm:'codeNm3-1'},
    {upperCode: 'code3', code:'code3-2', codeNm:'codeNm3-2'},
    {upperCode: 'code3', code:'code3-3', codeNm:'codeNm3-2'},
];
let columnsList =[
    {
        data: 'codeId',
        dataField: 'code',
        type: 'autocomplete2',
        source: codeList,
        labelTemplate: '{{code}} | {{codeNm}}',
        width: '200px',
        strict: true,
    },
    {
        data: 'codeId2',
        type: 'autocomplete2',
        source: function(value, rowObj, process){
            var result = [];
            var upperCode = rowObj['codeId'];
            if (upperCode) {
                result = subCodeList.filter(item => item.upperCode === upperCode);
            }
            process( result );
        },
        dataField: 'code',
        labelTemplate: '{{code}} | {{codeNm}}',
        strict: false,
        width: '200px'
    },
    {data: 'num3',width: '200px',},
];
let container = document.getElementById('example_handsontable');
let hot = new Handsontable(container, {
    data: mydata,
    minSpareRows: 0,
    colHeaders: true,
    contextMenu: true,
    columns: columnsList
});

const testBtn = document.getElementById('test_btn');
testBtn.addEventListener('click',(e) =>{
    console.log(hot.getSourceData());
});

