
var RTE = {};
var formatBlock = 'formatBlock';
var appendChild = function appendChild(parent, child) {
    return parent.appendChild(child);
};
var createElement = function createElement(tag) {
    return document.createElement(tag);
};
var exec = function exec(command) {
    var value;
    value = arguments.length > 1 && arguments.length < 2 && arguments[1] !== undefined ? arguments[1] : null;
    value = arguments.length > 2 && arguments.length < 4 ? arguments[2] : null;
    return document.execCommand(command, false, value);
};
var addEventListener = function addEventListener(parent, type, listener) {
    return parent.addEventListener(type, listener);
};
var queryCommandState = function queryCommandState(command) {
    return document.queryCommandState(command);
};
var queryCommandValue = function queryCommandValue(command) {
    return document.queryCommandValue(command);
};

var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]; for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; }
        }
    } return target;
};

var defaultActions = {
    bold: {
        icon: '<b>B</b>',
        title: 'Bold',
        state: function state() {
            return queryCommandState('bold');
        },
        result: function result() {
            return exec('bold');
        }
    },
    italic: {
        icon: '<i>I</i>',
        title: 'Italic',
        state: function state() {
            return queryCommandState('italic');
        },
        result: function result() {
            return exec('italic');
        }
    },
    underline: {
        icon: '<u>U</u>',
        title: 'Underline',
        state: function state() {
            return queryCommandState('underline');
        },
        result: function result() {
            return exec('underline');
        }
    },
    strikethrough: {
        icon: '<strike>S</strike>',
        title: 'Strike-through',
        state: function state() {
            return queryCommandState('strikeThrough');
        },
        result: function result() {
            return exec('strikeThrough');
        }
    },
    FontFamily: {
        icon: '<b>H<sub>1</sub></b>',
        title: 'FontFamily',
        result: function result() {
            return exec(formatBlock, '<h1>');
        }
    },
    FontSize: {
        icon: '<b>H<sub>2</sub></b>',
        title: 'FontSize',
        result: function result() {
            return exec(formatBlock, '<h2>');
        }
    },
    olist: {
        icon: '&#35;',
        title: 'Ordered List',
        result: function result() {
            return exec('insertOrderedList');
        }
    },
    ulist: {
        icon: '&#8226;',
        title: 'Unordered List',
        result: function result() {
            return exec('insertUnorderedList');
        }
    }
};
var defaultClasses = {
    actionbar: 'RTE-actionbar',
    button: 'RTE-button',
    content: 'RTE-content',
    selected: 'RTE-button-selected',
    Select: 'RTE-select'
};

RTE.init = function init(settings) {
    var actions = settings.actions ? settings.actions.map(function (action) {
        if (typeof action === 'string') return defaultActions[action]; else if (defaultActions[action.name]) return _extends({}, defaultActions[action.name], action);
        return action;
    }) : Object.keys(defaultActions).map(function (action) {
        return defaultActions[action];
    });

    var classes = _extends({}, defaultClasses, settings.classes);

    var defaultParagraphSeparator = 'div';

    var actionbar = createElement('div');
    actionbar.className = classes.actionbar;
    appendChild(settings.element, actionbar);

    var content = settings.element.content = createElement('div');
    content.contentEditable = true;
    content.className = classes.content;
    content.oninput = function (_ref) {
        var firstChild = _ref.target.firstChild;

        if (firstChild && firstChild.nodeType === 3) exec(formatBlock, '<' + defaultParagraphSeparator + '>'); else if (content.innerHTML === '<br>') content.innerHTML = '';
        settings.onChange(content.innerHTML);
    };
    content.onkeydown = function (event) {
        if (event.key === 'Tab') {
            event.preventDefault();
        } else if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
            setTimeout(function () {
                return exec(formatBlock, '<' + defaultParagraphSeparator + '>');
            }, 0);
        }
    };
    appendChild(settings.element, content);

    actions.forEach(function (action) {
        var button = createElement('button');
        button.className = classes.button;
        button.innerHTML = action.icon;
        button.title = action.title;
        button.setAttribute('type', 'button');
        button.onclick = function () {
            return action.result() && content.focus();
        };

        if (action.state) {
            var handler = function handler() {
                return button.classList[action.state() ? 'add' : 'remove'](classes.selected);
            };
            addEventListener(content, 'keyup', handler);
            addEventListener(content, 'mouseup', handler);
            addEventListener(button, 'click', handler);
        }

        appendChild(actionbar, button);
    });

    function createFormats(formats) {
        formats = formats.replace(/;$/, '').split(';');

        var i = formats.length;
        while (i--) {
            formats[i] = formats[i].split('=');
        }

        return formats;
    }

    function AddList() {
        var lst = createElement('select');
        lst.class = classes.Select;
        var defaultFontsFormats =
            'Arial=arial,helvetica,sans-serif;' +
            'Andale Mono=andale mono,monospace;' +
            'Arial Black=arial black,sans-serif;' +
            'Book Antiqua=book antiqua,palatino,serif;' +
            'Comic Sans MS=comic sans ms,sans-serif;' +
            'Courier New=courier new,courier,monospace;' +
            'Georgia=georgia,palatino,serif;' +
            'Helvetica=helvetica,arial,sans-serif;' +
            'Impact=impact,sans-serif;' +
            'Symbol=symbol;' +
            'Tahoma=tahoma,arial,helvetica,sans-serif;' +
            'Terminal=terminal,monaco,monospace;' +
            'Times New Roman=times new roman,times,serif;' +
            'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
            'Verdana=verdana,geneva,sans-serif;' +
            'Webdings=webdings;' +
            'Wingdings=wingdings,zapf dingbats';

        var items = [], fonts = createFormats(defaultFontsFormats);

        fonts.forEach(function (font) {
            var opt = new Option(font[0], font[1]);
            lst.options[lst.options.length] = opt;
        });

        lst.addEventListener('change', (function (e) {
            if (lst.value) {
                exec('FontName', false, lst.value) && content.focus();
            }
        }));
        return lst;
    };

    appendChild(actionbar, AddList());


    if (settings.styleWithCSS) exec('styleWithCSS');
    exec(defaultParagraphSeparator);

    return settings.element;
};