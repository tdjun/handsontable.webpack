import 'babel-polyfill';
import 'handsontable.css';
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import moment from 'moment';

import MergeHotGrid from './hot/mergehotgrid/merge.hot.grid';

// 플러스, 휴지통 아이콘만 추가함.
fontawesome.library.add(solid.faPlus);
fontawesome.library.add(solid.faTrashAlt);

// moment 언어설정
moment.locale('ko');
// console.log(moment(new Date()));
// console.log(moment().add(3, 'hours').fromNow());

// 1. rowData
let rowData = [
    {pk1:'pk1_001', pk2:'pk2_001', seq:1, article:'정격출력(rated output)', prfomnc:'22.4 kW', remark:''},
    {pk1:'pk1_001', pk2:'pk2_001', seq:2, article:'정격전압(rated voltage)', prfomnc:'28 V', remark:''},
    {pk1:'pk1_001', pk2:'pk2_001', seq:3, article:'정격전류(rated current)', prfomnc:'700A/3,500 rpm\n800a/4,000 rpm', remark:''},
    {pk1:'pk1_001', pk2:'pk2_001', seq:4, article:'운용속도 범위(speed range)', prfomnc:'2,500 ~ 11,000 rpm', remark:''},
    {pk1:'pk1_001', pk2:'pk2_001', seq:5, article:'최대속도(maximum speed', prfomnc:'13,000 rpm', remark:''},
    {pk1:'pk1_001', pk2:'pk2_001', seq:6, article:'과속도(over speed)', prfomnc:'14,000 rpm', remark:''},
    {pk1:'pk1_001', pk2:'pk2_001', seq:7, article:'리플전압', prfomnc:'4V 이하, peak-to-peak', remark:'MIL-DTL-62186'},
    {pk1:'pk1_001', pk2:'pk2_001', seq:8, article:'효율(efficiency)', prfomnc:'65% 이상', remark:'MIL-DTL-62186'}
];
// 2. columnInfo
let colInfo = [
    {width:25, headerRenderer: 'addRow', readOnly:true, addFunc: (rowData, selectedObj, endRow) =>
        {
            if (selectedObj){
                rowData.splice(endRow+1, 0, {pk1: 'pk1_001', pk2: 'pk2_001'});
            }else{
                rowData.push({pk1: 'pk1_001', pk2: 'pk2_001'});
            }
        }
    },
    {dataField:'article', label:'항목', width:100 },
    {dataField:'prfomnc', label:'목표 성능', width:200 },
    {dataField:'remark', label:'비고', width:100 },
    {width:20, label:'삭제', readOnly:true, renderType:'removeRow'}
];

// 3. render Handsontable
const container = document.getElementById('container');
const grid = new MergeHotGrid(colInfo, rowData, 30);
grid.renderHandsontable(container, {
    stretchH:    'all',
    contextMenu: false,
    colHeaders:  false,
    formulas:    true,
    data:           grid.initData(),
    columns:        grid.getGridHeader().getColumns(),
    colWidths:      grid.getGridHeader().getColWidths(),
    mergeCells:     grid.getMergeCells(),
    customBorders:  grid.getGridHeader().customBorders(),
    cells:          grid.getObjCell(),
});