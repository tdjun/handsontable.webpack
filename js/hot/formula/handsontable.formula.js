import Handsontable from 'handsontable';
import { Parser as FormulaParser } from 'hot-formula-parser';

//-- Variables -----//
const parser = new FormulaParser();

const CELL_TYPE = 'formula';
Handsontable.cellTypes.registerCellType(CELL_TYPE, {
    editor: Handsontable.editors.TextEditor,
    renderer: formulaRenderer,
});

//-- Constructor -----//
function init() {
    const instance = this;
    instance.formulasEnabled = !!instance.getSettings().formulas;

    if (instance.formulasEnabled) {
        instance.addHook('afterChange', afterChange);
    } else {
        instance.removeHook('afterChange', beforeChange);
    }
}

//-- private Methods -----//
function formulaRenderer(instance, TD, row, col, prop, value, cellProperties) {
    if (instance.formulasEnabled && isFormula(value)) {
        const resultObj = parser.parse(value.replace('=',''));

        // change background color
        if (resultObj.error){
            Handsontable.dom.addClass(TD, 'formula-error');
        } else {
            Handsontable.dom.removeClass(TD, 'formula-error');
            Handsontable.dom.addClass(TD, 'formula');
        }
        // console.log(value, resultObj);
        value = resultObj.error? resultObj.error : resultObj.result;

        // apply changes
        if (cellProperties.type === 'numeric' && resultObj.error==null ) {
            Handsontable.renderers.getRenderer('numeric').apply(this, [instance, TD, row, col, prop, value, cellProperties]);
        } else {
            Handsontable.renderers.getRenderer('text').apply(this, [instance, TD, row, col, prop, value, cellProperties]);
        }
    } else {
        if (cellProperties.type === 'numeric') {
            Handsontable.renderers.getRenderer('numeric').apply(this, arguments);
        } else {
            Handsontable.renderers.getRenderer('text').apply(this, arguments);
        }
    }
}
function afterChange(changes, source) {
    // console.log('afterChange', changes, source);
    const instance = this;
    const data = instance.getData();
    if (data === undefined) return;
    parser.on('callRangeValue', function(startCellCoord, endCellCoord, done) {
        const fragment = [];
        for (let row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
            const rowData = data[row];
            const colFragment = [];
            for (let col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
                let value = rowData[col]||0;
                if (value.toString().search('=') === 0) {
                    // console.log('target',rowData[col].slice(1));
                    value = parser.parse(rowData[col].slice(1)).result;
                }
                colFragment.push(value);
            }
            // console.log('rowData', rowData);
            fragment.push(colFragment);
        }
        // console.log('fragment', fragment);
        if (fragment) { done(fragment); }
    });

    instance.render();
}

//-- utils -----//
function isFormula(value) {
    if (value) {
        if (value[0] === '=') return true;
    }
    return false;
}
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

//-- prototype Methods -----//
// HandsontableFormula.prototype.formulaRenderer =formulaRenderer;
// HandsontableFormula.prototype.afterChange = afterChange;
// HandsontableFormula.prototype.beforeAutofillInsidePopulate =beforeAutofillInsidePopulate;
// HandsontableFormula.prototype.afterCreateRow = afterCreateRow;
// HandsontableFormula.prototype.afterCreateCol = afterCreateCol;
// HandsontableFormula.prototype.init = init;

//-- Handsontable Setting --/
Handsontable.hooks.add('beforeInit', init);
Handsontable.hooks.add('afterUpdateSettings', function () {
    init.call(this, 'afterUpdateSettings')
});

// Exposing HandsontableFormula
// export default HandsontableFormula;