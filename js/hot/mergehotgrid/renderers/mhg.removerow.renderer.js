import Handsontable from 'handsontable';

export default function removeRowRenderer(instance, TD, row, col, prop, value, cellProperties){
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (!TD.firstChild) { //http://jsperf.com/empty-node-if-needed
        //otherwise empty fields appear borderless in demo/renderers.html (IE)
        TD.appendChild(document.createTextNode(String.fromCharCode(160))); // workaround for https://github.com/handsontable/handsontable/issues/1946
        //this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
    }

    const button = document.createElement('div');
    Handsontable.dom.addClass(button, 'btn');
    button.innerHTML = '<i class="fas fa-trash-alt"></i>';

    Handsontable.dom.addEvent(button, 'mousedown', function(e){
        e.preventDefault();
        instance.alter("remove_row", row);
    });
    Handsontable.dom.addClass(TD, 'htEditRow');
    TD.appendChild(button);
}
