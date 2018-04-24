// handsontable/src/validators/autocompleteValidator.js 를 참고
import Handsontable from 'handsontable';

/**
 * Autocomplete cell validator.
 *
 * @private
 * @validator AutocompleteValidator
 * @param {*} value - Value of edited cell
 * @param {Function} callback - Callback called with validation result
 */
function Autocomplete2Validator(value, callback) {
    if (value == null) {
        value = '';
    }
    if (this.allowEmpty && value === '') {
        callback(true);
        return;
    }
    if (this.strict && this.source) {
        // tdjun edit start
        const dataField = this.dataField;
        if (typeof this.source === 'function') {
            const rowObj = this.instance.getSourceDataAtRow(this.row);
            this.source(value, rowObj, process(value, dataField, callback));
        } else {
            process(value, dataField, callback)(this.source);
        }
        // tdjun edit end
    } else {
        callback(true);
    }
}

// tdjun edit
function process(value, dataField, callback) {
    const originalVal = value;

    return function (source) {
        let found = false;
        for (let s = 0, slen = source.length; s < slen; s++) {
            if (originalVal === source[s][dataField]) {
                found = true; // perfect match
                break;
            }
        }
        callback(found);
    };
}

Handsontable.validators.registerValidator('autocomplete2', Autocomplete2Validator);

export default Autocomplete2Validator;