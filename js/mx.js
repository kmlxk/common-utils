
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

/**
* jQuery.extend( target [, object1 ] [, objectN... ] )
*/
Object.prototype.extend = function () {
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if (typeof target !== "object" && typeof target !== "function") {
        target = {};
    }
    if (length === i) {
        target = this;
        --i;
    }
    for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                    continue;
                }
                if (deep && copy && (typeof copy === 'object' || typeof copy === 'array') && !copy.nodeType) {
                    var clone = src && (typeof src === 'object' || typeof src === 'array') ? src : typeof copy === 'array' ? [] : {};
                    target[name] = this.extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}