import Handsontable from 'handsontable';

export function headerRenderer(){
    const headerHeight = this.headerHeight;
    return function (instance, TD, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        TD.className = 'htMergeHeader';
        TD.setAttribute('style', 'height:'+headerHeight+'px;');
    };
}

export function formulaRenderer(colInfo){
    return  function (instance, TD, row, col, prop, value, cellProperties){
        Handsontable.renderers.getRenderer('formula').apply(this, arguments);
        return TD;
    }
}

// 텍스트 렌더러
export function textCellRenderer(colInfo){
    return function (instance, td, row, col, prop, value, cellProperties){
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        if(colInfo.style) td.style = Object.assign(td.style, colInfo.style);//_.extend(td.style, colInfo.style);
        return td;
    }
}

// 숫자형 렌더러
export function numberCellRenderer(colInfo){
    return function (instance, TD, row, col, prop, value, cellProperties){
        Handsontable.NumericCell.renderer.apply(this, arguments);
        if(colInfo.style) td.style = Object.assign(td.style, colInfo.style);//_.extend(td.style, colInfo.style);
        return td;
    }
}
