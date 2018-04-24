// handsontable/src/renderers/autocompleteRenderer.js 참고
import Handsontable from 'handsontable';
import Handlebars from 'handlebars';

// Autocomplete2Renderer Start
let clonableWRAPPER = document.createElement('DIV');
clonableWRAPPER.className = 'htAutocompleteWrapper';

let clonableARROW = document.createElement('DIV');
clonableARROW.className = 'htAutocompleteArrow';
// workaround for https://github.com/handsontable/handsontable/issues/1946
// this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
clonableARROW.appendChild(document.createTextNode(String.fromCharCode(9660)));

let wrapTdContentWithWrapper = (TD, WRAPPER) => {
    WRAPPER.innerHTML = TD.innerHTML;
    empty(TD);
    TD.appendChild(WRAPPER);
};

/**
 * Autocomplete2 renderer
 *
 * @private
 * @renderer AutocompleteRenderer
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
function Autocomplete2Renderer(instance, TD, row, col, prop, value, cellProperties) {
    let WRAPPER = clonableWRAPPER.cloneNode(true); //this is faster than createElement
    let ARROW = clonableARROW.cloneNode(true); //this is faster than createElement

    // tdjun edit start
    let labelTemplate = cellProperties.labelTemplate,
        dataField     = cellProperties.dataField,
        source        = cellProperties.source;
    let rowObj        = instance.getSourceDataAtRow(row);
    let template      = Handlebars.compile(labelTemplate);
    // findObj
    let list = [];
    if (Array.isArray(source)) {
        list = source;
    } else if (typeof source == 'function') {
        // console.log('Autocomplete2Renderer', value, rowObj);
        source(value, rowObj, (choices) => {
            list = choices;
        });
    } else{
        list = null;
    }
    let findObj = list.find(e=> e[dataField] === value);

    if (cellProperties.allowHtml) {
        Handsontable.renderers.getRenderer('html').apply(this, arguments);
    } else {
        Handsontable.renderers.getRenderer('text').apply(this, arguments);
    }

    if (findObj) {
        TD.innerHTML = template(findObj);
    }
    // tdjun edit end
    TD.appendChild(ARROW);
    Handsontable.dom.addClass(TD, 'htAutocomplete');

    if (!TD.firstChild) { // http://jsperf.com/empty-node-if-needed
        // otherwise empty fields appear borderless in demo/renderers.html (IE)
        TD.appendChild(document.createTextNode(String.fromCharCode(160))); // workaround for https://github.com/handsontable/handsontable/issues/1946
        // this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
    }

    if (!instance.acArrowListener) {
        let eventManager = new Handsontable.EventManager(instance);

        // not very elegant but easy and fast
        instance.acArrowListener = function(event) {
            if (Handsontable.dom.hasClass(event.target, 'htAutocompleteArrow')) {
                // tdjun edit
                //instance.view.wt.getSetting('onCellDblClick', null, new CellCoords(row, col), TD);
                instance.view.wt.getSetting('onCellDblClick',null,null,TD);
            }
        };

        eventManager.addEventListener(instance.rootElement, 'mousedown', instance.acArrowListener);

        // We need to unbind the listener after the table has been destroyed
        instance.addHookOnce('afterDestroy', () => {
            eventManager.destroy();
        });
    }
}

Handsontable.renderers.registerRenderer('autocomplete2', Autocomplete2Renderer);

export default Autocomplete2Renderer;
