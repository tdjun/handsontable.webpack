import TreeModel from 'TreeModel';
import addRowHeaderRenderer from './renderers/mhg.addrow.renderer';
import removeRowRenderer from './renderers/mhg.removerow.renderer';
import {headerRenderer, textCellRenderer, numberCellRenderer, formulaRenderer} from './renderers/mhg.other.renderer';

//-- Variables -----//
const colInfo = {
    dataField: null,
    label: null,
    children: null,
    width: null,
    dataType: null,   //date, amt, num
    renderType: null, //file, popup, url, removeRow
    option: {
        dateFormat: null, //dataType:date -> YYYY.MM.DD
    },
    style: {},
    valueFunc: null, //function(value, colVO)
    dataFunc: null,  //function(value, colVO)
    labelFunc: null, //function(value, colVO)
    mergeRowField: null,
};

//-- Constructor -----//
function MergeHotGridHeader(model, headerHeight, isDataObj) {
    this.leafNodes = [];
    this.groupNodes = [];
    this.colInfos = [];
    this.depth = 0;
    this.values = [];
    this.objValue = [];
    this.headerHeight = 35;

    this.setColInfo(model, headerHeight, isDataObj);
};

//-- private Methods -----//
function setMergeHotGrid(mergeHotGrid){
    this.mergeHotGrid = mergeHotGrid;
}
function setColInfo(model, headerHeight, isDataObj) {
    const leafNodes = this.leafNodes,
        groupNodes = this.groupNodes,
        colInfos = this.colInfos,
        me=this;
    let depth = this.depth;
    const root = new TreeModel().parse({ id: 'root', children: model});
    let col=0,row= 0;

    root.walk(function (node) {
        if (node.isRoot()) return;

        row = node.getPath().length-2;
        depth = Math.max(depth, row);
        node.row = row;node.col = col;
        let label = node.model.label, dataField = node.model.dataField;
        if (isDataObj){
            me.setDataObjVaule(row, col, label, dataField);
        }else{
            me.setDataVaule(row, col, label);
        }
        if ( !node.hasChildren() ) {
            leafNodes.push(node);
            colInfos.push(node.model);
            col++;
        }else{
            groupNodes.push(node);
        }
    });
    this.depth = depth;
    this.headerHeight = headerHeight||this.headerHeight;
    this.isDataObj = isDataObj;
    //console.log(depth);
    //console.log(me.getData());
    //console.log(me.mergeCells() );
    //console.log( this.objValue );
    if (isDataObj){
        const leafModel = leafNodes.map(value => value['model']); //_.pluck(leafNodes,'model');
        //TODO SH: 수정
        const columns = [];
        leafModel.forEach(function(column) {
            // dataType convert
            if(column.dataType === 'date'){
                column.type = column.dataType;
                column.dateFormat = column.dateFormat == null ? 'YYYY-MM-DD': column.dateFormat;
            }
            columns.push({
                data: column.dataField,
                type: column.type,
                editor: column.editor,
                source: column.source,
                format: column.format,
                selectOptions : column.selectOptions,
                dateFormat : column.dateFormat,
                validator: column.validator,
                renderer: column.renderer,
                readOnly: column.readOnly
            });
        });
        //var dataFields = _.pluck(leafModel,'dataField');
        //var columns = [];
        //_.each(dataFields,function(dataField){
        //  columns.push({data: dataField});
        //});
        this.columns = columns;
    }
}
function setDataVaule(row, col, value){
    const values = this.values;
    if (values[row]===undefined) values[row]=[];
    values[row][col] = value;
}
function setDataObjVaule(row, col, value, dataField){
    if (dataField===undefined) return;
    const objValue = this.objValue;
    if (objValue[row]===undefined) objValue[row]={};
    setDepthValue(objValue[row],dataField,value);
}
function getData(){
    const reuslt=[],
        depth = this.depth,leafNodes = this.leafNodes,
        values = this.values;

    if (this.isDataObj){
        return this.objValue;
    }

    for(let i=0;i<=depth;i++){
        const eachArr = [];
        for(let j=0;j<leafNodes.length;j++){
            eachArr.push(
                values[i][j]?values[i][j]:""
            );
        }
        reuslt.push( eachArr );
    }
    return reuslt;
}
//[{ row: 5, col: 0, rowspan: 1, colspan: 14 }]
function mergeCells(offsetRow, offsetCol) {
    const result = [],
        leafNodes = this.leafNodes, groupNodes = this.groupNodes,
        depth = this.depth;
    //rowMerge
    for(let i=0;i<leafNodes.length;i++){
        const node = leafNodes[i];
        const parentCnt = node.getPath().length-1;
        if (parentCnt<=depth){
            result.push({row: parentCnt-1, col: i, rowspan: depth+2-parentCnt, colspan:1});
        }
    }
    //colMerge
    for(let i=0;i<groupNodes.length;i++){
        const node = groupNodes[i];
        let cnt=-1, groupCnt=-1;
        node.all(function (node) {
            //console.log(node.model.id, node.children.length)
            if (node.children.length>0){ groupCnt++; }
            cnt++;
        });
        result.push({row: node.row, col: node.col, rowspan: 1, colspan:cnt-groupCnt});
        //console.log(node.model.id, node.row, node.col, 1, cnt, groupCnt);
    }
    return result;
}
function getCellPropertiesFunc() {
    const depth = this.depth, colInfos = this.colInfos;
    const mergeHotGrid = this.mergeHotGrid;
    const model = mergeHotGrid.gridList.model;
    const me = this;
    return function (row, col, prop) {
        const cellProperties = {};
        if (row <= depth){
            switch(colInfos[col].headerRenderer){
                case 'addRow':
                    cellProperties.renderer = addRowHeaderRenderer.call(me,colInfos[col], mergeHotGrid);
                    cellProperties.readOnly = true;
                    break;
                default:
                    cellProperties.renderer = headerRenderer.call(me);
                    cellProperties.readOnly = true;
                    break;
            }
        }else{

            switch(colInfos[col].renderType){
                case 'file':
                case 'popup':
                case 'html':
                case 'img':
                    const renderFunc = colInfos[col].rendererFunc;
                    cellProperties.renderer = renderFunc.call(me, colInfos[col], colInfos);
                    cellProperties.readOnly = true;
                    break;
                case 'removeRow':
                    cellProperties.renderer = removeRowRenderer;
                    break;
                default:
                    //TODO : 수식이 Text로 나오기때문에 수정필요
                    cellProperties.renderer = colInfos[col].renderer || textCellRenderer.call(me, colInfos[col]);
                    break;
            }
            switch(colInfos[col].dataType){
                case 'num':
                    cellProperties.numericFormat = colInfos[col].numericFormat;
                    cellProperties.renderer = colInfos[col].renderer || numberCellRenderer.call(me, colInfos[col]);
                    break;
            }
            switch(colInfos[col].type){
                case 'numeric':
                    cellProperties.numericFormat = colInfos[col].numericFormat;
                    cellProperties.renderer = colInfos[col].renderer || numberCellRenderer.call(me, colInfos[col]);
                    break;
            }

            // 수식 renderer
            if(colInfos[col].isFormula){
                cellProperties.renderer = formulaRenderer.call(me, colInfos[col]);
            }

            // 합계 row readOnly 설정 추가
            const rowData = model[row - (depth+1)];
            if(rowData && (rowData.formula === 'subSum' || rowData.formula === 'totalSum') ){
                cellProperties.numericFormat = colInfos[col].numericFormat;
                cellProperties.readOnly = true;
            }
        }
        //console.log('row', row, 'col', col, 'label', colInfos[col].label, cellProperties);
        return cellProperties;
    };
}
//{row: 1, col: 0, renderer: greenRenderer}
function getObjCellProperties() {
    const result = [];
    const depth = this.depth+1, colInfos = this.colInfos;
    for(let i=0;i<depth;i++){
        for(let j=0;j<colInfos.length;j++){
            const colInfo = colInfos[j];
            switch(colInfo.headerRenderer){
                case 'addRow':
                    result.push({row: i, col: j, renderer: addRowHeaderRenderer.call(this), readOnly: true});
                    break;
                default:
                    result.push({row: i, col: j, renderer: headerRenderer.call(this), readOnly: true});
                    break;
            }
        }
    }
    return result;
}
function getColumns(){ return this.columns }
function getColWidths(){
    const leafNodes = this.leafNodes;
    const leafModel = leafNodes.map(value=>value['model']);   //_.pluck(leafNodes,'model');
    const widths = leafModel.map(value => value['width']); //_.pluck(leafModel,'width');
    return widths;
}
function customBorders(){
    const leafNodes = this.leafNodes;
    return [{
        range: {
            from: {row: 0, col: 0},
            to: {row: this.depth, col: leafNodes.length-1}
        },
        bottom: { width: 2, color: '#5292F7' }
    }];
}
//-- utils -----//
// nestedObjects
// http://stackoverflow.com/questions/10253307/setting-a-depth-in-an-object-literal-by-a-string-of-dot-notation
function setDepthValue(obj, path, value) {
    const tags = path.split("."),
          len = tags.length - 1;

    for (let i = 0; i < len; i++) {
        if (obj[tags[i]]===undefined){
            obj[tags[i]]={};
        }
        obj = obj[tags[i]];
    }
    obj[tags[len]] = value;
}

//-- prototype Methods -----//
MergeHotGridHeader.prototype.setColInfo = setColInfo;
MergeHotGridHeader.prototype.setDataVaule = setDataVaule;
MergeHotGridHeader.prototype.setDataObjVaule = setDataObjVaule;
MergeHotGridHeader.prototype.setMergeHotGrid = setMergeHotGrid;
MergeHotGridHeader.prototype.getData = getData;
MergeHotGridHeader.prototype.mergeCells =mergeCells;
MergeHotGridHeader.prototype.getCellPropertiesFunc =getCellPropertiesFunc;
MergeHotGridHeader.prototype.getObjCellProperties =getObjCellProperties;
MergeHotGridHeader.prototype.getColumns = getColumns;
MergeHotGridHeader.prototype.getColWidths = getColWidths;
MergeHotGridHeader.prototype.customBorders =customBorders;

//-- Exposing GridHeader --//
export default MergeHotGridHeader;