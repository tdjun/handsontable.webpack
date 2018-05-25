import moment from 'moment';

//-- Variables -----//

//-- Constructor -----//
function MergeHotGridList(gridHeader, model, isDataObj) {
    //if ( gridHeader.constructor.name == "GridHeader" ) //에러처리
    this.offsetRow = gridHeader.depth+1;
    this.colInfos = gridHeader.colInfos;
    this.values = [];
    this.model = model;
    this.isDataObj = isDataObj;
    // this.hot;

    this.setValueInfo();
}

//-- private Methods -----//
function setHot(hot) {
    this.hot = hot;
}
function setValueInfo() {
    const model = this.model;
    const isDataObj = this.isDataObj;
    const colInfos = this.colInfos;
    const offsetRow = this.offsetRow;
    //isDataObj 가 true colInfos 에 isFormula 이 있으면
    if (isDataObj && colInfos.findIndex(item => item['isFormula'])>-1) {
        setFormulaValues.call(this, colInfos, model, offsetRow );
    }else{
        setSimpleValues.call(this, model, colInfos);
    }
}

// setFormulaValues Start --------------------------------------------------------
function setFormulaValues( colInfos, model, offsetRow){
    for (let j=0;j<colInfos.length;j++) {
        const colInfo = colInfos[j],
            dataField = colInfo.dataField,
            subSumCells = [];
        if (colInfo.isFormula === 'colSum'){
            const formulaStr = getDepth(colInfo,'option.formula');
            if (formulaStr===undefined) return;
            setColFormulaValues(colInfos, model, offsetRow, dataField, formulaStr); //col 계산
        }else {
            const preCell = translateCellCoords(j, offsetRow);
            setRowFormulaValues.call(this, colInfo, model, offsetRow, j, dataField, subSumCells, preCell); //row 계산
        }
    }
};
//col 계산
function setColFormulaValues(colInfos, model, offsetRow, dataField, formulaStr){
    for (let i = 0; i < model.length; i++) {
        const rowObj = model[i];
        const replaceStr = formulaStr.replace(/@\w+/g, function(str, p1, offset, s) {
            const colIdx = colInfos.findIndex(item => item.dataField === str.substr(1));//_.findIndex(colInfos, {dataField: str.substr(1)});
            return translateCellCoords(colIdx, offsetRow+i);
        });
        rowObj[dataField] = replaceStr;
    }
}
//row 계산
function setRowFormulaValues( colInfo, model, offsetRow, j, dataField, subSumCells, preCell){
    for (let i = 0; i < model.length; i++) {
        const rowObj = model[i],
            formulaField = rowObj[colInfo.isFormula];
        const colIdx = j, rowIdx = offsetRow + i;
        if (!formulaField) {
            // subSum , totalSum 아닐 경우
            if(dataField) // render field 가 아닐 경우
                rowObj[dataField] = getValue.call(this, dataField, colInfo, rowObj, j, i);
            continue;
        }
        if (formulaField === 'subSum') {
            rowObj[dataField] = `=SUM(${preCell}:${translateCellCoords(colIdx, rowIdx - 1)})`;
            preCell = translateCellCoords(colIdx, rowIdx + 1);
            subSumCells.push(translateCellCoords(colIdx, rowIdx));
        } else if (formulaField === 'totalSum' && subSumCells.length > 0) {
            // D3+ D6 을 SUM(D3:D3, D6:D6) 형태로 바꿈.. 영역으로 설정해야 참조됨.
            const temp = subSumCells.map(cell => cell+':'+cell);
            rowObj[dataField] = '=SUM(' + temp.join(',')+')';
        }
    }
}
// setFormulaValues End --------------------------------------------------------

//setSimpleValues --------------------------------------------------------
function setSimpleValues(model, colInfos) {
    const dataFields = colInfos.map(value => value['dataField']); //_.pluck(colInfos, 'dataField');
    const values = [];
    for (let i=0;i<model.length;i++) {
        const rowObj = model[i], rowArr = [];
        for (let j=0;j<dataFields.length;j++) {
            const dataField = dataFields[j], colInfo = colInfos[j];
            rowArr.push( getValue.call(this, dataField, colInfo, rowObj, j, i) );
        }
        values.push(rowArr);
    }
    this.values = values;
}
function getValue(dataField, colInfo, rowObj, colIdx, rowIdx) {
    let value = rowObj[dataField];
    switch (colInfo.dataType){
            case 'date'  : if (value) value = moment(value).format('YYYY-MM-DD'); break;
        case 'custom':
            value = colInfo.valueFunc.call(this, dataField, rowObj);
            break;
    }
    return value;
}
//setSimpleValues end--------------------------------------------------------

function mergeCells() {
    const offsetRow = this.offsetRow,
        colInfos = this.colInfos;
    let model = this.model;
    if (this.hot){
        const temp = this.hot.getData();
        model = temp.slice(offsetRow, temp.length);
    }

    const result = [];
    for(let col=0;col<colInfos.length;col++){
        const colInfo = colInfos[col];
        const mergeRowField = colInfo.mergeRowField;
        if (colInfo.mergeRowField===undefined) continue;

        let bMergeRowStart=0, bMergeRowval=null;
        let row;
        for(row=offsetRow;row<model.length+offsetRow;row++){
            const rowObj = model[row-offsetRow];
            const rowVal = rowObj[mergeRowField];
            if (rowVal===undefined){
                bMergeRowStart = row;
            }
            if (rowVal != bMergeRowval){
                if (row-offsetRow>0 && row-bMergeRowStart>1){
                    //console.log(bMergeRowStart, row,  col, row-bMergeRowStart);
                    result.push({row:bMergeRowStart, col:col, colspan:1, rowspan:row-bMergeRowStart});
                }
                bMergeRowStart = row;
            }
            bMergeRowval = rowVal;
        }
        if (row-bMergeRowStart>1){
            //console.log("last",bMergeRowStart, row,  col, row-bMergeRowStart);
            result.push({row:bMergeRowStart, col:col, colspan:1, rowspan:row-bMergeRowStart});
        }
    }
    return result;
}
function getData(){
    if (!this.isDataObj){
        return this.values;
    }
    // code, date 등의 convert data를 model data에 반영
    for(let i=0; i< this.values.length; i++){
        const row = this.values[i];
        for(let j=0; j < row.length; j++ ){
            const colVal = row[j];
            const column = this.colInfos[j];
            if(column.dataField === undefined) continue;
            this.model[i][column.dataField] = colVal;
        }
    }
    return this.model;
}

//-- utils -----//
function translateCellCoords(colIdx, rowIdx){
    return toChar(colIdx)+(rowIdx+1);
}
/**
 * convert number to string char, e.g 0 => A, 25 => Z, 26 => AA
 * @param {Number} num
 * @returns {String}
 */
function toChar(num) {
    let s = '';
    while (num >= 0) {
        s = String.fromCharCode(num % 26 + 97) + s;
        num = Math.floor(num / 26) - 1;
    }
    return s.toUpperCase();
}
function getDepth(obj, path) {
    const tags = path.split("."), len = tags.length - 1;
    for (let i = 0; i < len; i++) {
        obj = obj[tags[i]];
        if (obj === undefined) return;
    }
    return obj[tags[len]];
};


//-- prototype Methods -----//
MergeHotGridList.prototype.setValueInfo =setValueInfo;
MergeHotGridList.prototype.setHot = setHot;
MergeHotGridList.prototype.mergeCells =mergeCells;
MergeHotGridList.prototype.getData = getData;

// Exposing MergeHotGridList
export default MergeHotGridList;