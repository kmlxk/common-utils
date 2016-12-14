Mx = {
    namespace: function(names) {
        var sep = names.split('.'),
                i, scope = window;
        for (i = 0; i < sep.length; i++) {
            if (typeof scope[sep[i]] === 'undefined') {
                scope[sep[i]] = {};
            }
            scope = scope[sep[i]];
        }
    },
    applyDefault: function(src, defaults) {
        for (var k in defaults) {
            if (typeof src[k] === 'undefined' && typeof defaults[k] !== 'undefined') {
                src[k] = defaults[k];
            }
        }
        return src;
    },
    camelCase: function(string, upperFirst) {
        var rdashAlpha = /_([\da-z])/gi;
        if (typeof upperFirst === 'undefined') {
            upperFirst = false;
        }
        if (upperFirst) {
            string = string.substr(0, 1).toUpperCase() + string.substr(1);
        }
        return string.replace(rdashAlpha, function(all, letter) {
            return letter.toUpperCase();
        });
    },
    loadJS: function(id, fileUrl, fnComplete) {
        console.log('loadJS', id, fileUrl);
        var scriptTag = document.getElementById(id);
        var oHead = document.getElementsByTagName('head').item(0);
        var oScript = document.createElement("script");
        if (scriptTag) {
            oHead.removeChild(scriptTag);
        }
        oScript.id = id;
        oScript.type = "text/javascript";
        oScript.src = fileUrl;
        if (typeof fnComplete === 'function') {
            oScript.onload = oScript.onreadystatechange = function() {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    fnComplete();
                    // Handle memory leak in IE
                    oScript.onload = oScript.onreadystatechange = null;
                }
            };
        }
        oHead.appendChild(oScript);
    },
    createDivById: function(id) {
        var el = document.getElementById(id);
        if (el) {
            return;
        }
        el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
    },
    parseUrlParameters: function(url) { //定义函数
        if (typeof url === 'undefined') {
            return {};
        }
        var pattern = /(\w+)=(\w+)/ig;//定义正则表达式
        var params = {};//定义数组
        url.replace(pattern, function(exp, key, val) {
            params[key] = val;
        });
        return params;//返回这个数组.
    },
    hashCode: function(str) {
        var hash = 0;
        if (str == null || str.length == 0)
            return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
};
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        // month
        "d+": this.getDate(),
        // day
        "h+": this.getHours(),
        // hour
        "m+": this.getMinutes(),
        // minute
        "s+": this.getSeconds(),
        // second
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // quarter
        "S": this.getMilliseconds()
                // millisecond
    };
    if (/(y+)/.test(format) || /(Y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
Mx.getTimestamp = function() {
    var timestamp = Math.round(new Date().getTime() / 1000);
    return timestamp;
};
Mx.getDateTimeStr = function(timestamp) {
    if (timestamp == null || timestamp == 0) {
        return '';
    }
    return (new Date(timestamp * 1000)).format("yyyy-MM-dd hh:mm:ss");
};
Mx.getDateStr = function(timestamp) {
    if (timestamp == null || timestamp == 0) {
        return '';
    }
    return (new Date(timestamp * 1000)).format("yyyy-MM-dd");
};
Mx.debug = function(msg, category) {
    if (Mx.debug.mode == 0) {
        return;
    }
    if (typeof category === 'undefined') {
        category = '';
    }
    var filterExclude = Mx.debug.filter || [],
            i = 0,
            len = filterExclude.length;
    if (category.length > 0) {
        for (; i < len; i++) {
            if (category.indexOf(filterExclude[i]) >= 0) {
                return;
            }
        }
    }
    if (typeof msg == 'object') {
        msg = JSON.stringify(msg);
    }
    if (Mx.debug.mode == 2) {
        alert('[' + category + ']' + msg);
    }
    console.log('[' + category + ']' + msg);
}
Mx.debug.mode = 1;
Mx.debug.filter = ['timer', 'dump'];
Mx.namespace('Mx.model');
Mx.model.fromString = function(str) {
    var ret = [],
            lines = str.split(/\|/gi),
            i = 0,
            len = lines.length,
            sep = [];
    for (; i < len; i++) {
        sep = lines[i].split(/,/gi);
        if (sep.length >= 2) {
            ret.push({
                name: sep[0],
                text: sep[1]
            });
        }
    }
    return ret;
};
Mx.namespace('Mx.array');
Mx.array = {
    search: function(ar, key, value) {
        var i = 0,
                len = ar.length;
        for (; i < len; i++) {
            if (typeof ar[i][key] !== 'undefined' && ar[i][key] === value) {
                return i;
            }
        }
        return -1;
    },
    removeAt: function(ar, index) {
        if (index < 0) {
            return ar;
        } else {
            return ar.slice(0, ar).concat(ar.slice(ar + 1, ar.length));
        }
    },
    /**
     * 获取数组中的列
     * @param {array} ar 字典数组，例如 [{col1:val1},{col1:val2}]
     * @param {mixed} key 如果不是回调函数则取出所有键名称中的数值，例如[val, val2]，如果是回调函数则调用函数，将函数返回值放入数组返回。
     * */
    getCols: function(ar, key) {
        var i = 0,
                len = ar.length,
                ret = [];
        if (typeof key === 'function') {
            for (; i < len; i++) {
                ret.push(key.apply(this, [ar[i]]));
            }
            return ret;
        }
        for (; i < len; i++) {
            if (typeof ar[i][key] !== 'undefined') {
                ret.push(ar[i][key]);
            }
        }
        return ret;
    },
    filter: function(ar, fnCallback) {
        var i = 0,
                len = ar.length,
                ret = [];
        for (; i < len; i++) {
            if (fnCallback.apply(this, [ar[i]])) {
                ret.push(ar[i]);
            }
        }
        return ret;
    },
    toTree: function(list, idField, parentField, depthField) {
        if (typeof depthField === 'undefined') {
            depthField = 'depth';
        }
        var i = 0, len = list.length, item = null, nodeDict = {}, result = {}, parentId = null, root = null, roots = [], parent = null;
        for (i = 0, len = list.length; i < len; i++) {
            item = list[i];
            nodeDict[item[idField]] = item;
        }
        for (i = 0, len = list.length; i < len; i++) {
            item = list[i];
            item[depthField] = 0;
            parentId = item[parentField];
            if (typeof parentId === 'undefined' || parentId == null
                    // 对于0、-1、空白之类的parent_id，一般就是根节点。
                    || parentId == '' || parentId == 0 || parentId == -1 ||
                    // 如果没有找到可能是孤立的节点
                    typeof nodeDict[parentId] === 'undefined' || nodeDict[parentId] == null) {
                item[depthField] = 0;
                root = item;
                // 有可能有多个根节点
                roots.push(item);
                continue;
            }
            parent = nodeDict[parentId];
            if (typeof parent[depthField] == 'undefined' || parent[depthField] == 0) {
                parent[depthField] = 1;
            }
            if (typeof parent.children === 'undefined'
                    || parent.children == null) {
                parent.children = [];
            }
            item[depthField] = parent[depthField] + 1;
            parent.children.push(item);
        }
        if (roots.length > 1) {
            // 对于多个根节点的森林，修改返回的根节点
            return {children: roots, name: ''};
        }
        return root;
    }
};

Mx.namespace('Mx.web');
Mx.web = {
    downloadFile: function(url) {
        var elemIF = document.createElement("iframe");
        elemIF.src = url;
        elemIF.style.display = "none";
        document.body.appendChild(elemIF);
    }
};
Mx.namespace('Mx.dictionary');
Mx.dictionary = {
    find: function(kv, value) {
        for (var prop in kv) {
            if (kv.hasOwnProperty(prop)) {
                if (kv[ prop ] === value)
                    return prop;
            }
        }
        return null;
    }
};

Mx.namespace('Mx.form');
Mx.form = {
    getFieldsValue: function(fields) {
        var i = 0,
                len = fields.length,
                $field,
                key,
                ret = {};
        for (; i < len; i++) {
            $field = $(fields[i]);
            key = $field.attr('name') || $field.attr('id');
            ret[key] = $field.val();
        }
        return ret;
    },
    setValues: function($parent, kv, tag) {
        var k,
                $field;
        if (typeof tag === 'undefined') {
            tag = 'input';
        }
        for (k in kv) {
            $parent.find(tag + '[name=' + k + ']').val(kv[k]);
        }
    },
    exportValues: function($parent, submitSelector) {
        var values = {};
        if (typeof (submitSelector) == 'undefined') {
            submitSelector = '.submitvalue';
        }
        $parent.find(submitSelector).each(function() {
            var $input = $(this);
            values[$input.data('key')] = $input.val();
        });
        return values;
    },
    importValues: function($parent, values, submitSelector) {
        if (typeof (submitSelector) == 'undefined') {
            submitSelector = '.submitvalue';
        }
        $parent.find(submitSelector).each(function() {
            var $input = $(this);
            var key = $input.data('key');
            $input.val(values[key]);
        });
    },
    resetValues: function($parent, submitSelector) {
        if (typeof (submitSelector) == 'undefined') {
            submitSelector = '.submitvalue';
        }
        $parent.find(submitSelector).each(function() {
            var $input = $(this);
            $input.val('');
        });
    },
    buildSelectHtml: function(map, defaultText, selected) {
        if (typeof (selected) == 'undefined') {
            selected = [];
        }
        var html = [];
        html.push('<option value="">' + defaultText + '</option>');
        var k = null, attr = null, text = null;
        for (k in map) {
            if (typeof map[k] == 'object') {
                text = k;
            } else {
                text = map[k];
            }
            attr = typeof selected.findIndex(function(val, index, arr) {
                return val == k;
            }) != 'undefined' ? 'selected="selected"' : '';
            html.push('<option value="' + k + '">' + text + '</option>');
        }
        return html.join('');
    },
    buildSelectHtmlFromTree: function(tree, defaultText, valueKey, textKey, indentText) {
        indentText = indentText || '　';
        valueKey = valueKey || 'id';
        textKey = textKey || 'text';
        var html = [];
        html.push('<option value="">' + defaultText + '</option>');
        var stack = [tree];
        var item = null;
        var whitespace = null;
        while (stack.length >= 0) {
            item = stack.pop();
            if (typeof item == 'undefined' || item == null) {
                break;
            }
            whitespace = (new Array(item.depth)).join(indentText);
            html.push('<option value="' + item[valueKey] + '">' + whitespace + item[textKey] + '</option>');
            // 如有子节点则加入
            if (typeof item.children !== 'undefined') {
                stack = stack.concat(item.children);
            }
        }
        return html.join('');
    },
    buildCheckboxHtml: function(map, attrHtml) {
        var html = [];
        var k = null;
        var id = null;
        for (k in map) {
            id = 'chk_auto_' + name + "_" + k;
            html.push('<input id="' + id + '" type="checkbox" ' + attrHtml + ' value="' + k + '" /><label for="' + id + '">' + map[k] + '</label>');
        }
        return html.join('');
    },
    getCheckboxValue: function($items) {
        var i = 0,
                len = $items.length,
                $item,
                checked,
                ret = [];
        for (; i < len; i++) {
            $item = $($items[i]);
            checked = $item.attr('checked');
            if (checked || checked == 'checked') {
                ret.push($item.val());
            }
        }
        return ret;
    },
    getRadioValue: function($items) {
        var i = 0,
                len = $items.length,
                $item,
                checked;
        for (; i < len; i++) {
            $item = $($items[i]);
            checked = $item.attr('checked');
            if (checked || checked == 'checked') {
                return $item.val();
            }
        }
        return null;
    }
};
Mx.namespace('Mx.json');
Mx.json.toObject = function(str) {
    return (new Function("return " + str))();
};

Mx.namespace('Mx.browser');
Mx.browser.alert = function(message) {
    var domain = window;
    if (navigator.userAgent.indexOf('OpenWebKitSharp') >= 0) {
        domain = window.external;
    }
    return domain.alert(message);
};

Mx.browser.closeWindow = function() {
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
            window.opener = null;
            window.close();
        }
        else {
            window.open('', '_top');
            window.top.close();
        }
    }
    else if (navigator.userAgent.indexOf("Firefox") > 0) {
        window.location.href = 'about:blank ';
        //window.history.go(-2);  
    }
    else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
    }
};

// 为IE8增加Function.bind方法
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {
                },
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis
                            ? this
                            : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

$(function() {
    if (false && navigator.userAgent.indexOf('OpenWebKitSharp') >= 0) {
        window.external.alert(navigator.userAgent);
        // 在内嵌浏览器中无法使用alert,confirm,prompt,重写这些方法
        // window.external.alert('内嵌浏览器中无法使用alert,confirm,prompt,重写这些方法');
        alert = window.external.alert;
        confirm = window.external.confirm;
        prompt = window.external.prompt;
    }
});

(function() {
    if (!Array.prototype.findIndex) {
        // IE没有实现此方法
        Array.prototype.findIndex = function(fn) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (fn.apply(this, [this[i], i, this])) {
                    return i;
                }
            }
            return -1;
        }
    }
})();
