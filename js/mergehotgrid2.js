import 'babel-polyfill';
import 'handsontable.css';
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import moment from 'moment';

import MergeHotGrid from './hot/mergehotgrid/merge.hot.grid';
import './hot/formula/handsontable.formula';



// 플러스, 휴지통 아이콘만 추가함.
fontawesome.library.add(solid.faPlus);
fontawesome.library.add(solid.faTrashAlt);

// moment 언어설정
moment.locale('ko');


// 1. rowData
const rowData = [
    {"stgTypeCd":"기초","anlSeq":1,"costTypeCd":"출연금","agcCol1":250000,"agcCol2":200000},
    {"stgTypeCd":"기초","anlSeq":1,"costTypeCd":"현금","agcCol1":139400,"agcCol2":139100},
    {"stgTypeCd":"기초","anlSeq":1,"costTypeCd":"현물","agcCol1":600,"agcCol2":500},
    {"stgTypeCd":"기초","anlSeq":1,"costTypeCd":"합계",formula:"subSum"},
    {"stgTypeCd":"기초","anlSeq":2,"costTypeCd":"출연금","agcCol1":170000,"agcCol2":150000},
    {"stgTypeCd":"기초","anlSeq":2,"costTypeCd":"현금","agcCol1":144200,"agcCol2":107000},
    {"stgTypeCd":"기초","anlSeq":2,"costTypeCd":"현물","agcCol1":null,"agcCol2":20500},
    {"stgTypeCd":"기초","anlSeq":2,"costTypeCd":"합계",formula:"subSum"},
    {"stgTypeCd":"","anlSeq":"총계","costTypeCd":"합계",formula:"totalSum"}
];

// 2. columnInfo
let colInfo = [
    {
        dataField:'stgTypeCd', label:'구분',
        children: [
            {
                dataField:'stgTypeCd', label:'단계', width:50, readOnly: true,
                mergeRowField:'stgTypeCd',
                style:{textAlign:'center'},
            },
            {
                dataField:'anlSeq', label:'년차', width:50, readOnly: true,
                mergeRowField:'anlSeq',
                style:{textAlign:'center'},
                renderer : function(instance, td, row, col, prop, value){
                    td.innerHTML = value === '총계'? value : value + '차 년도';
                    return td;
                }
            },
            {
                dataField:'costTypeCd', label:'비용구분', width:50, readOnly: true,
                style:{textAlign:'center'}
            },
        ]
    },
    {
        dataField:'agcCol1', label:'삼성SDS', width:100,
        isFormula:'formula', type:'numeric', numericFormat:{pattern:'0,0'},
        style:{textAlign:'center'}
    },
    {
        dataField:'agcCol2', label:'LG CNS', width:100,
        isFormula:'formula', type: 'numeric', numericFormat:{pattern:'0,0'},
        style:{textAlign:'center'}
    },
    {
        dataField:'colSum', label: '계', width: 80, readOnly: true,
        isFormula:'colSum', type:'numeric', numericFormat:{pattern:'0,0'},
        option: {formula: '=SUM(@agcCol1:@agcCol2)'}
    }
];


// 3. render Handsontable
const container = document.getElementById("container");
const grid = new MergeHotGrid(colInfo, rowData, 30);
grid.renderHandsontable(container, {
    stretchH:    'all',
    fillHandle:  false,
    contextMenu: false,
    rowHeaders:  false,
    colHeaders:  false,
    formulas:    true,
    data:           grid.initData(),
    columns:        grid.getGridHeader().getColumns(),
    colWidths:      grid.getGridHeader().getColWidths(),
    mergeCells:     grid.getMergeCells(),
    customBorders:  grid.getGridHeader().customBorders(),
    cells:          grid.getObjCell(),
});
