import Handsontable from 'handsontable';
import MergeHotGridHeader from './merge.hot.grid.header';
import MergeHotGridList from './merge.hot.grid.list';

// Merge handsontable Grid

//-- Variables -----//

//-- Constructor -----//
function MergeHotGrid(colInfo, rowData, headerHeight){

    const gridHeader = new MergeHotGridHeader(colInfo, headerHeight, true);
    this.gridHeader = gridHeader;
    this.gridList = new MergeHotGridList(gridHeader, rowData, true);

    gridHeader.setMergeHotGrid(this);
}
function initData() {
    const gridHeader = this.gridHeader,
          gridList = this.gridList;
    const result = gridHeader.getData().concat(gridList.getData()); //_.union( gridHeader.getData(), gridList.getData() );
    return result;
}
//{row: 1, col: 0, renderer: greenRenderer}
function getObjCell(){
    return this.gridHeader.getCellPropertiesFunc();
}
function getMergeCells(){
    const gridHeader = this.gridHeader,
          gridList   = this.gridList;
    const result = gridHeader.mergeCells().concat(gridList.mergeCells()); //_.union( gridHeader.mergeCells(), gridList.mergeCells() );
    return result;
}
function renderHandsontable(container, prop){
    const hot = new Handsontable(container, prop);
    this.hot = hot;
    this.gridList.setHot(hot);

    return hot;
}

function getData() {
    const headerDepth = this.gridHeader.depth + 1;
    const hotData = this.hot.getData();
    const colInfos = this.gridHeader.colInfos;
    const gridList = this.gridList;
    // data convert
    const resultData = [];
    hotData.slice(headerDepth).forEach(function (data) {
        const obj = {};
        data.map(function (val, key) {
            const colInfo = colInfos.find(function (colInfo) {
                return colInfo.dataField === key
            });
            // String => Date
            if (colInfo !== undefined && colInfo.dataType !== undefined && colInfo.dataType === 'date') {
                //data[key] = moment(val).format();
                val = moment(val).format();
            }
            // codeNm => code
            if (colInfo !== undefined && colInfo.dataType !== undefined && colInfo.dataType === 'code') {
                const option = colInfo.option;
                const code = gridList.getStrCode(val, option);
                //console.log("code",code);
                val = code;
            }
            obj[key] = val
        });
        resultData.push(obj);
    });
    return resultData;
}

function addBtnClick(instance, callback){
    const rowData = instance.getSourceData();
    //instance.getSelected() [startRow, startCol, endRow, endCol].
    const selectedIdxs = instance.getSelected();
    if ( selectedIdxs ){
        const endRow = selectedIdxs.pop()[2];
        if(endRow < this.gridHeader.depth) return;
        // console.log('endRow', endRow);
        const selectedObj = instance.getSourceDataAtRow(endRow);
        callback(rowData, selectedObj, endRow);
    }else{
        callback(rowData);
    }
    instance.updateSettings({
        mergeCells : this.getMergeCells()
    });
    // instance.mergeCells = new Handsontable.MergeCells( this.getMergeCells() );
    // instance.render();
}

//-- prototype Methods -----//
MergeHotGrid.prototype.initData = initData;
MergeHotGrid.prototype.getGridHeader = function() { return this.gridHeader; };
MergeHotGrid.prototype.getGridList = function() { return this.gridList; };
MergeHotGrid.prototype.getObjCell = getObjCell;
MergeHotGrid.prototype.getData = getData;
MergeHotGrid.prototype.getMergeCells = getMergeCells;

MergeHotGrid.prototype.renderHandsontable = renderHandsontable;
MergeHotGrid.prototype.addBtnClick = addBtnClick;

// Exposing GridList
export default MergeHotGrid;