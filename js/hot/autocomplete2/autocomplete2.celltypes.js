import Handsontable from 'handsontable';

import './autocomplete2.renderer.js';
import './autocomplete2.editor.js';
import './autocomplete2.validator.js';

const CELL_TYPE = 'autocomplete2';

Handsontable.cellTypes.registerCellType(CELL_TYPE, {
    editor: Handsontable.editors.getEditor(CELL_TYPE),
    renderer: Handsontable.renderers.getRenderer(CELL_TYPE),
    validator: Handsontable.validators.getValidator(CELL_TYPE),
});