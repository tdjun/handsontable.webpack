import Handsontable from 'handsontable';

export default function addRowHeaderRenderer(colInfo, mergeHotGrid){
    const headerHeight = this.headerHeight;
    return function (instance, TD, row, col, prop, value, cellProperties){
        Handsontable.renderers.TextRenderer.apply(this, arguments);

        if (!TD.firstChild) { //http://jsperf.com/empty-node-if-needed
            //otherwise empty fields appear borderless in demo/renderers.html (IE)
            TD.appendChild(document.createTextNode(String.fromCharCode(160))); // workaround for https://github.com/handsontable/handsontable/issues/1946
            //this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
        }

        const button = document.createElement('div');
        Handsontable.dom.addClass(button, 'btn');
        button.innerHTML = '<i class="fas fa-plus"></i>';

        Handsontable.dom.addEvent(button, 'mousedown', function (e){
            e.preventDefault();
            e.stopImmediatePropagation();
            if (colInfo.addFunc===undefined) return;
            mergeHotGrid.addBtnClick.call(mergeHotGrid, instance, colInfo.addFunc);
        });
        Handsontable.dom.addClass(TD, 'htEditRow');
        Handsontable.dom.addClass(TD, 'htMergeHeader');
        TD.setAttribute('style', 'height:'+headerHeight+'px;');
        TD.appendChild(button);
    }
}
