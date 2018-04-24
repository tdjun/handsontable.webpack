// handsontable/src/editors/Autocomplete2Editor.js 참고
// select2-editer.js 참고
import Handsontable from 'handsontable';
import Handlebars from 'handlebars';

// Handsontable
//["Core", "DefaultSettings", "EventManager", "_getListenersCounter", "buildDate", "packageName", "version", "hooks", "__GhostTable", "helper", "dom", "cellTypes", "editors", "renderers", "validators", "plugins", "languages"]
// Handsontable.helper
//["to2dArray", "extendArray", "pivot", "arrayReduce", "arrayFilter", "arrayMap", "arrayEach", "arraySum", "arrayMax", "arrayMin",
// "arrayAvg", "arrayFlatten", "arrayUnique", "isIE8", "isIE9", "isSafari", "isChrome", "isMobileBrowser", "spreadsheetColumnLabel", "spreadsheetColumnIndex", "createSpreadsheetData", "createSpreadsheetObjectData", "createEmptySpreadsheetData", "translateRowsToColumns", "cellMethodLookupFactory", "getNormalizedDate", "requestAnimationFrame",
// "cancelAnimationFrame", "isTouchSupported", "isWebComponentSupportedNatively", "hasCaptionProblem", "getComparisonFunction", "isFunction", "throttle", "throttleAfterHits", "debounce", "pipe", "partial", "curry", "curryRight", "stringify", "isDefined", "isUndefined", "isEmpty", "isRegExp", "isNumeric", "rangeEach", "rangeEachReverse", "valueAccordingPercent", "duckSchema", "inherit", "extend", "deepExtend", "deepClone", "clone", "mixin", "isObjectEqual", "isObject", "defineGetter", "objectEach", "getProperty", "deepObjectSize", "createObjectPropListener", "hasOwnProperty", "columnFactory", "toUpperCaseFirst", "equalsIgnoreCase",
// "randomString", "isPercentValue", "substitute", "stripTags", "KEY_CODES", "isPrintableChar", "isMetaKey", "isCtrlKey", "isCtrlMetaKey", "isKey"]
//Handsontable.plugins
//["__esModule", "AutoColumnSize", "AutoFill", "AutoRowSize", "ColumnSorting", "Comments", "ContextMenu", "CopyPaste", "CustomBorders", "DragToScroll", "ManualColumnFreeze", "ManualColumnMove", "ManualColumnResize", "ManualRowMove", "ManualRowResize", "MergeCells", "MultipleSelectionHandles", "ObserveChanges", "PersistentState", "Search", "TouchScroll", "UndoRedo", "BasePlugin", "registerPlugin"]
//Handsontable.dom
//["HTML_CHARACTERS", "getParent", "closest", "closestDown", "isChildOf", "isChildOfWebComponentTable", "polymerWrap", "polymerUnwrap", "index", "overlayContainsElement", "hasClass", "addClass", "removeClass", "removeTextNodes", "empty", "fastInnerHTML", "fastInnerText", "isVisible", "offset", "getWindowScrollTop", "getWindowScrollLeft", "getScrollTop", "getScrollLeft", "getScrollableElement", "getTrimmingContainer", "getStyle", "getComputedStyle", "outerWidth", "outerHeight", "innerHeight", "innerWidth", "addEvent", "removeEvent", "getCaretPosition", "getSelectionEndPosition", "getSelectionText", "setCaretPosition", "getScrollbarWidth", "hasVerticalScrollbar", "hasHorizontalScrollbar", "setOverlayPosition", "getCssTransform", "resetCssTransform", "isInput", "isOutsideInput", "stopImmediatePropagation", "isImmediatePropagationStopped", "stopPropagation", "pageX", "pageY", "isRightClick", "isLeftClick"]
// var keys = [];
// for(var k in Handsontable.dom) keys.push(k);
// console.log(keys);

const HandsontableEditor = Handsontable.editors.HandsontableEditor;

const Autocomplete2Editor = HandsontableEditor.prototype.extend();

/**
 * @private
 * @editor Autocomplete2Editor
 * @class Autocomplete2Editor
 * @dependencies HandsontableEditor
 */
Autocomplete2Editor.prototype.init = function() {
    HandsontableEditor.prototype.init.apply(this, arguments);
    this.query = null;
    this.strippedChoices = [];
    this.rawChoices = [];
    this.rawMapLabelItem = {};
};

Autocomplete2Editor.prototype.getValue = function() {
    // tdjun edit
    const dataField = this.cellProperties.dataField;
    const label = this.TEXTAREA.value;
    let selectedItem =
        this.rawChoices.find((item) => {
            const value = item[dataField];
            return value === label;
        });
    let isDefined = Handsontable.helper.isDefined(selectedItem);
    if (isDefined) {
        return selectedItem[dataField];
    }
    selectedItem = this.rawMapLabelItem[label];
    isDefined = Handsontable.helper.isDefined(selectedItem);
    return (isDefined)? selectedItem[dataField] : this.TEXTAREA.value;
    // tdjun edit end
};


Autocomplete2Editor.prototype.createElements = function() {
    HandsontableEditor.prototype.createElements.apply(this, arguments);
    Handsontable.dom.addClass(this.htContainer, 'Autocomplete2Editor');
    Handsontable.dom.addClass(this.htContainer, window.navigator.platform.indexOf('Mac') === -1 ? '' : 'htMacScroll');
};

var skipOne = false;
function onBeforeKeyDown(event) {
    skipOne = false;
    let editor = this.getActiveEditor();
    const KEY_CODES = Handsontable.helper.KEY_CODES;
    if (Handsontable.helper.isPrintableChar(event.keyCode) || event.keyCode === KEY_CODES.BACKSPACE ||
        event.keyCode === KEY_CODES.DELETE || event.keyCode === KEY_CODES.INSERT) {
        let timeOffset = 0;

        // on ctl+c / cmd+c don't update suggestion list
        if (event.keyCode === KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
            return;
        }
        if (!editor.isOpened()) {
            timeOffset += 10;
        }

        if (editor.htEditor) {
            editor.instance._registerTimeout(setTimeout(() => {
                editor.queryChoices(editor.TEXTAREA.value);
                skipOne = true;
            }, timeOffset));
        }
    }
}
Autocomplete2Editor.prototype.prepare = function() {
    this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
    HandsontableEditor.prototype.prepare.apply(this, arguments);
};

Autocomplete2Editor.prototype.open = function() {
    // Ugly fix for handsontable which grab window object for autocomplete scroll listener instead table element.
    this.TEXTAREA_PARENT.style.overflow = 'auto';
    HandsontableEditor.prototype.open.apply(this, arguments);
    this.TEXTAREA_PARENT.style.overflow = '';

    let choicesListHot = this.htEditor.getInstance();
    let _this = this;
    let trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;

    this.TEXTAREA.style.visibility = 'visible';
    this.focus();

    choicesListHot.updateSettings({
        colWidths: trimDropdown ? [Handsontable.dom.outerWidth(this.TEXTAREA) - 2] : void 0,
        width: trimDropdown ? Handsontable.dom.outerWidth(this.TEXTAREA) + Handsontable.dom.getScrollbarWidth() + 2 : void 0,
        afterRenderer(TD, row, col, prop, value, cellProperties) {
            let {filteringCaseSensitive, allowHtml} = _this.cellProperties;
            let indexOfMatch;
            let match;

            value = Handsontable.helper.stringify(value);

            if (value && !allowHtml) {
                indexOfMatch = filteringCaseSensitive === true ? value.indexOf(this.query) : value.toLowerCase().indexOf(_this.query.toLowerCase());

                if (indexOfMatch !== -1) {
                    match = value.substr(indexOfMatch, _this.query.length);
                    value = value.replace(match, `<strong>${match}</strong>`);
                }
            }
            TD.innerHTML = value;
        },
        autoColumnSize: true,
        modifyColWidth(width, col) {
            // workaround for <strong> text overlapping the dropdown, not really accurate
            let autoWidths = this.getPlugin('autoColumnSize').widths;
            if (autoWidths[col]) {
                width = autoWidths[col];
            }
            return trimDropdown ? width : width + 15;
        }
    });

    // Add additional space for autocomplete holder
    this.htEditor.view.wt.wtTable.holder.parentNode.style['padding-right'] = `${Handsontable.dom.getScrollbarWidth() + 2}px`;

    if (skipOne) {
        skipOne = false;
    }

    _this.instance._registerTimeout(setTimeout(() => {
        _this.queryChoices(_this.TEXTAREA.value);
    }, 0));
};

Autocomplete2Editor.prototype.close = function() {
    HandsontableEditor.prototype.close.apply(this, arguments);
};
Autocomplete2Editor.prototype.queryChoices = function(query) {
    // console.log('queryChoices', query);
    this.query = query;
    const source = this.cellProperties.source;
    if (typeof source == 'function') {
        const rowObj = this.instance.getSourceDataAtRow(this.row);
        source.call(this, query, rowObj, (choices) => {
            this.rawChoices = choices;

            this.updateChoicesList(this.stripValuesIfNeeded(choices));
        });
    } else if (Array.isArray(source)) {
        this.rawChoices = source;
        this.updateChoicesList(this.stripValuesIfNeeded(source));
    } else {
        this.updateChoicesList([]);
    }
};

Autocomplete2Editor.prototype.updateChoicesList = function(choices) {
    // console.log("Autocomplete2Editor updateChoicesList", choices);
    let pos = Handsontable.dom.getCaretPosition(this.TEXTAREA);
    let endPos = Handsontable.dom.getSelectionEndPosition(this.TEXTAREA);
    let sortByRelevanceSetting = this.cellProperties.sortByRelevance;
    let filterSetting = this.cellProperties.filter;
    let orderByRelevance = null;
    let highlightIndex = null;

    if (sortByRelevanceSetting) {
        // tdjun edit start
        orderByRelevance = Autocomplete2Editor.sortByRelevance(
            this.getValue(),
            choices,
            this.cellProperties.filteringCaseSensitive
        );
    }
    // console.log('orderByRelevance', orderByRelevance);
    let orderByRelevanceLength = Array.isArray(orderByRelevance) ? orderByRelevance.length : 0;
    if (filterSetting === false) {
        if (orderByRelevanceLength) {
            highlightIndex = orderByRelevance[0];
        }
    } else {
        let sorted = [];

        for (let i = 0, choicesCount = choices.length; i < choicesCount; i++) {
            if (sortByRelevanceSetting && orderByRelevanceLength <= i) {
                break;
            }
            if (orderByRelevanceLength) {
                sorted.push(choices[orderByRelevance[i]]);
            } else {
                sorted.push(choices[i]);
            }
        }

        highlightIndex = 0;
        choices = sorted;
    }
    // console.log("Autocomplete2Editor updateChoicesList", choices);
    this.strippedChoices = choices;
    this.htEditor.loadData(Handsontable.helper.pivot([choices]));

    this.updateDropdownHeight();

    this.flipDropdownIfNeeded();

    if (this.cellProperties.strict === true) {
        this.highlightBestMatchingChoice(highlightIndex);
    }
    this.instance.listen(false);

    Handsontable.dom.setCaretPosition(this.TEXTAREA, pos, (pos === endPos ? void 0 : endPos));
};

Autocomplete2Editor.prototype.flipDropdownIfNeeded = function() {
    let textareaOffset = Handsontable.dom.offset(this.TEXTAREA);
    let textareaHeight = Handsontable.dom.outerHeight(this.TEXTAREA);
    let dropdownHeight = this.getDropdownHeight();
    let trimmingContainer = Handsontable.dom.getTrimmingContainer(this.instance.view.wt.wtTable.TABLE);
    let trimmingContainerScrollTop = trimmingContainer.scrollTop;
    let headersHeight = Handsontable.dom.outerHeight(this.instance.view.wt.wtTable.THEAD);
    let containerOffset = {
        row: 0,
        col: 0
    };

    if (trimmingContainer !== window) {
        containerOffset = Handsontable.dom.offset(trimmingContainer);
    }

    let spaceAbove = textareaOffset.top - containerOffset.top - headersHeight + trimmingContainerScrollTop;
    let spaceBelow = trimmingContainer.scrollHeight - spaceAbove - headersHeight - textareaHeight;
    let flipNeeded = dropdownHeight > spaceBelow && spaceAbove > spaceBelow;

    if (flipNeeded) {
        this.flipDropdown(dropdownHeight);
    } else {
        this.unflipDropdown();
    }

    this.limitDropdownIfNeeded(flipNeeded ? spaceAbove : spaceBelow, dropdownHeight);

    return flipNeeded;
};

Autocomplete2Editor.prototype.limitDropdownIfNeeded = function(spaceAvailable, dropdownHeight) {
    if (dropdownHeight > spaceAvailable) {
        let tempHeight = 0;
        let i = 0;
        let lastRowHeight = 0;
        let height = null;

        do {
            lastRowHeight = this.htEditor.getRowHeight(i) || this.htEditor.view.wt.wtSettings.settings.defaultRowHeight;
            tempHeight += lastRowHeight;
            i++;
        } while (tempHeight < spaceAvailable);

        height = tempHeight - lastRowHeight;

        if (this.htEditor.flipped) {
            this.htEditor.rootElement.style.top = `${parseInt(this.htEditor.rootElement.style.top, 10) + dropdownHeight - height}px`;
        }

        this.setDropdownHeight(tempHeight - lastRowHeight);
    }
};
Autocomplete2Editor.prototype.flipDropdown = function(dropdownHeight) {
    let dropdownStyle = this.htEditor.rootElement.style;
    dropdownStyle.position = 'absolute';
    dropdownStyle.top = `${-dropdownHeight}px`;
    this.htEditor.flipped = true;
};
Autocomplete2Editor.prototype.unflipDropdown = function() {
    let dropdownStyle = this.htEditor.rootElement.style;
    if (dropdownStyle.position === 'absolute') {
        dropdownStyle.position = '';
        dropdownStyle.top = '';
    }
    this.htEditor.flipped = void 0;
};
Autocomplete2Editor.prototype.updateDropdownHeight = function() {
    const currentDropdownWidth = this.htEditor.getColWidth(0) + Handsontable.dom.getScrollbarWidth() + 2;
    let trimDropdown = this.cellProperties.trimDropdown;

    this.htEditor.updateSettings({
        height: this.getDropdownHeight(),
        width: trimDropdown ? void 0 : currentDropdownWidth
    });

    this.htEditor.view.wt.wtTable.alignOverlaysWithTrimmingContainer();
};
Autocomplete2Editor.prototype.setDropdownHeight = function(height) {
    this.htEditor.updateSettings({height});
};
Autocomplete2Editor.prototype.finishEditing = function(restoreOriginalValue) {
    if (!restoreOriginalValue) {
        this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
    }
    HandsontableEditor.prototype.finishEditing.apply(this, arguments);
};
Autocomplete2Editor.prototype.highlightBestMatchingChoice = function(index) {
    if (typeof index === 'number') {
        this.htEditor.selectCell(index, 0, void 0, void 0, void 0, false);
    } else {
        this.htEditor.deselectCell();
    }
};
/**
 * Filters and sorts by relevance
 * @param value
 * @param choices
 * @param caseSensitive
 * @returns {Array} array of indexes in original choices array
 */
Autocomplete2Editor.sortByRelevance = function(value, choices, caseSensitive) {
    let choicesRelevance = [];
    let currentItem;
    let valueLength = value.length;
    let valueIndex;
    let charsLeft;
    let result = [];
    let i;
    let choicesCount = choices.length;

    if (valueLength === 0) {
        for (i = 0; i < choicesCount; i++) {
            result.push(i);
        }
        return result;
    }

    for (i = 0; i < choicesCount; i++) {
        currentItem = Handsontable.helper.stripTags(Handsontable.helper.stringify(choices[i]));

        if (caseSensitive) {
            valueIndex = currentItem.indexOf(value);
        } else {
            valueIndex = currentItem.toLowerCase().indexOf(value.toLowerCase());
        }

        if (valueIndex !== -1) {
            charsLeft = currentItem.length - valueIndex - valueLength;

            choicesRelevance.push({
                baseIndex: i,
                index: valueIndex,
                charsLeft,
                value: currentItem
            });
        }
    }

    choicesRelevance.sort((a, b) => {

        if (b.index === -1) {
            return -1;
        }
        if (a.index === -1) {
            return 1;
        }

        if (a.index < b.index) {
            return -1;
        } else if (b.index < a.index) {
            return 1;
        } else if (a.index === b.index) {
            if (a.charsLeft < b.charsLeft) {
                return -1;
            } else if (a.charsLeft > b.charsLeft) {
                return 1;
            }
        }

        return 0;
    });

    for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
        result.push(choicesRelevance[i].baseIndex);
    }
    return result;
};
Autocomplete2Editor.prototype.getDropdownHeight = function() {
    let firstRowHeight = this.htEditor.getInstance().getRowHeight(0) || 23;
    let visibleRows = this.cellProperties.visibleRows;

    return this.strippedChoices.length >= visibleRows ? (visibleRows * firstRowHeight) : (this.strippedChoices.length * firstRowHeight) + 8;
};
Autocomplete2Editor.prototype.stripValueIfNeeded = function (value) {
    return this.stripValuesIfNeeded([value])[0];
};

Autocomplete2Editor.prototype.stripValuesIfNeeded = function (values) {
    // console.log('stripValuesIfNeeded values', values);
    const {allowHtml, labelTemplate, dataField} = this.cellProperties;
    const template = Handlebars.compile(labelTemplate);
    // tdjun edit start
    const stringifiedValues = Handsontable.helper.arrayMap(values, (value) => {
        const label = template(value);
        this.rawMapLabelItem[label] = value;
        return label;
    });
    // tdjun edit end
    const strippedValues = Handsontable.helper.arrayMap(stringifiedValues, (value) => (allowHtml ? value : Handsontable.helper.stripTags(value)));

    return strippedValues;
};

Autocomplete2Editor.prototype.allowKeyEventPropagation = function(keyCode) {
    const selectedRange = this.htEditor.getSelectedRangeLast();

    let selected = {row: selectedRange ? selectedRange.from.row : -1};
    let allowed = false;
    const KEY_CODES = Handsontable.helper.KEY_CODES;
    if (keyCode === KEY_CODES.ARROW_DOWN && selected.row > 0 && selected.row < this.htEditor.countRows() - 1) {
        allowed = true;
    }
    if (keyCode === KEY_CODES.ARROW_UP && selected.row > -1) {
        allowed = true;
    }

    return allowed;
};

Autocomplete2Editor.prototype.discardEditor = function(result) {
    HandsontableEditor.prototype.discardEditor.apply(this, arguments);
    this.instance.view.render();
};

Handsontable.editors.registerEditor('autocomplete2', Autocomplete2Editor);

export default Autocomplete2Editor;