Mx = {
    /**
     * 定义命名空间
     * @param {type} names 可以用.分割的命名空间字符串
     * @returns {undefined}
     */
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
    /**
     * 向src中未定义的字段中写入默认初始化数组对应值
     * @param {type} src
     * @param {type} defaults
     * @returns {unresolved}
     */
    applyDefault: function(src, defaults) {
        for (var k in defaults) {
            if (typeof src[k] === 'undefined' && typeof defaults[k] !== 'undefined') {
                src[k] = defaults[k];
            }
        }
        return src;
    },
    /**
     * 将下划线分隔的变量转换为驼峰命名法
     * @param {type} string
     * @param {type} upperFirst
     * @returns {unresolved}
     */
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
    /**
     * 动态加载js
     * @param {type} id
     * @param {type} fileUrl
     * @param {type} fnComplete
     * @returns {undefined}
     */
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
    /**
     * 动态创建div
     * @param {type} id
     * @returns {undefined}
     */
    createDivById: function(id) {
        var el = document.getElementById(id);
        if (el) {
            return;
        }
        el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
    },
    /**
     * 转换URL中的参数
     * @param {type} url
     * @returns {object}
     */
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
    /**
     * 计算hash
     * @param {type} str
     * @returns {Number}
     */
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
/**
 * 日期格式化 示例：(new Date()).format('YYYY-MM-dd hh:mm:ss')
 * @param {type} format 'YYYY-MM-dd hh:mm:ss'
 * @returns {unresolved}
 */
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
/**
 * 获取Unix时间戳(1970秒)
 * @returns {Number}
 */
Mx.getTimestamp = function() {
    var timestamp = Math.round(new Date().getTime() / 1000);
    return timestamp;
};
/**
 * 根据Unix时间戳获取日期时间字符串
 * @param {type} timestamp
 * @returns {String}
 */
Mx.getDateTimeStr = function(timestamp) {
    if (timestamp == null || timestamp == 0) {
        return '';
    }
    return (new Date(timestamp * 1000)).format("yyyy-MM-dd hh:mm:ss");
};
/**
 * 根据Unix时间戳获取日期字符串
 * @param {type} timestamp
 * @returns {String}
 */
Mx.getDateStr = function(timestamp) {
    if (timestamp == null || timestamp == 0) {
        return '';
    }
    return (new Date(timestamp * 1000)).format("yyyy-MM-dd");
};
/**
 * 输出调试信息
 * @param {type} msg
 * @param {type} category
 * @returns {undefined}
 */
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
// 全局变量 ，1以firebug console方式、 2以alert弹出信息方式
Mx.debug.mode = 1;
// 全局变量 ，跳过不显示的调试信息类型
Mx.debug.filter = ['timer', 'dump'];

Mx.namespace('Mx.model');
/**
 * 解析简易kv数据  "key,value|key,value|key,value"
 * @param {type} str
 * @returns {Array|Mx.model.fromString.ret}
 */
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
    /**
     * 搜索数组，支持一维、二维数组
     * @param {type} ar 待查数组
     * @param {type} key 二维数组中的键
     * @param {type} value 待查的值
     * @returns {Number} 返回索引下标
     */
    search: function(ar, key, value) {
        // 在一维数组中查找
        if (typeof value == 'undefined') {
            return ar.indexOf(key);
        }
        var i = 0,
                len = ar.length;
        for (; i < len; i++) {
            if (typeof ar[i][key] !== 'undefined' && ar[i][key] === value) {
                return i;
            }
        }
        return -1;
    },
    /**
     * 删除指定位置的元素
     * @param {type} ar
     * @param {type} index
     * @returns {unresolved}
     */
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
    /**
     * 过滤数组
     * @param {type} ar
     * @param {type} fnCallback
     * @returns {Array|Mx.array.filter.ret}
     */
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
    /**
     * 将平面数组转换为树形结构
     * @param {type} list
     * @param {type} idField
     * @param {type} parentField
     * @param {type} depthField
     * @returns {Mx.array.toTree.Anonym$5|Number|Window}
     */
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
    },
    /**
     * 将数组转换为以某一个字段为主键的快查hash表
     * @param {type} arr
     * @param {type} key
     * @returns {Mx.array.toDictionary.arr}
     */
    toDictionary: function(arr, key) {
        var i = 0,
                len = arr.length,
                ret = {};
        for (; i < len; i++) {
            ret[arr[i][key]] = arr[i];
        }
        return ret;
    },
    /**
     * 循环数组
     * @param {type} arr
     * @param {type} fn
     * @returns {undefined}
     */
    each: function(arr, fn) {
        var i = 0,
                len = arr.length,
                ret = {};
        for (; i < len; i++) {
            fn.apply(this, [arr[i]]);
        }
    }
};

Mx.namespace('Mx.web');
Mx.web = {
    /**
     * 通过创建iframe下载文件
     * @param {type} url
     * @returns {undefined}
     */
    downloadFile: function(url) {
        var elemIF = document.createElement("iframe");
        elemIF.src = url;
        elemIF.style.display = "none";
        document.body.appendChild(elemIF);
    },
    /**
     * 获取URL参数变量
     * @param {type} name
     * @returns {unresolved}
     */
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 匹配目标参数
        var result = window.location.search.substr(1).match(reg);  // 对querystring匹配目标参数
        if (result != null) {
            return decodeURIComponent(result[2]);
        } else {
            return null;
        }
    },
    /**
     * 获取所有URL参数变量
     * @returns {object}
     */
    getQueryParameters: function() {
        var qs = location.search.substr(1), // 获取url中"?"符后的字串   
                args = {}, // 保存参数数据的对象
                items = qs.length ? qs.split("&") : [], // 取得每一个参数项,
                item = null,
                len = items.length;

        for (var i = 0; i < len; i++) {
            item = items[i].split("=");
            var name = decodeURIComponent(item[0]),
                    value = decodeURIComponent(item[1]);
            if (name) {
                args[name] = value;
            }
        }
        return args;
    }
};
Mx.namespace('Mx.dictionary');
Mx.dictionary = {
    /**
     * 在字典中查找数据，返回值主键名
     * @param {type} kv
     * @param {type} value
     * @returns {string} 主键名
     */
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

Mx.namespace('Mx.ajax');
Mx.ajax = {
    /**
     * 封装了错误回调函数的jQuery.ajax请求
     * @param {type} requestType 请求类型, POST/GET
     * @param {type} url  请求URL
     * @param {type} params 请求参数
     * @param {type} success 成功回调 function(json)
     * @param {type} error 错误回调 function(XMLHttpRequest, textStatus, errorThrown)
     * @param {type} resultType 返回值类型text/html/json
     * @returns {undefined}
     */
    request: function(requestType, url, params, success, error, resultType) {
        if (typeof resultType == 'undefined') {
            resultType = 'json';
        }
        jQuery.ajax({
            url: url,
            type: requestType,
            data: params,
            dataType: resultType,
            success: success,
            error: error
        });
    },
    /**
     * 封装了错误回调函数的jQuery.ajax.get请求
     * @param {type} url  请求URL
     * @param {type} params 请求参数
     * @param {type} success 成功回调 function(json)
     * @param {type} error 错误回调 function(XMLHttpRequest, textStatus, errorThrown)
     * @param {type} resultType 返回值类型text/html/json
     * @returns {undefined}
     */
    get: function(url, params, success, error, resultType) {
        Mx.ajax.request('get', url, params, success, error, resultType);
    },
    /**
     * 封装了错误回调函数的jQuery.ajax.post请求
     * @param {type} url  请求URL
     * @param {type} params 请求参数
     * @param {type} success 成功回调 function(json)
     * @param {type} error 错误回调 function(XMLHttpRequest, textStatus, errorThrown)
     * @param {type} resultType 返回值类型text/html/json
     * @returns {undefined}
     */
    post: function(url, params, success, error, resultType) {
        Mx.ajax.request('post', url, params, success, error, resultType);
    }
}

Mx.namespace('Mx.form');
Mx.form = {
    /**
     * 获取所有jQuery对象字段的数值
     * @param {type} fields
     * @returns {unresolved}
     */
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
    /**
     * 按照name设置所有jQuery对象字段的数值
     * @param {type} $parent
     * @param {type} kv
     * @param {type} tag
     * @returns {undefined}
     */
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
    /**
     * 导出父元素下所有的待提交数组，通过data-key/name表示提交的key
     * @param {type} $parent 父元素
     * @param {type} submitSelector 子提交选择器，默认 '.submitvalue'
     * @returns {value}
     */
    exportValues: function($parent, submitSelector) {
        var values = {};
        if (typeof (submitSelector) == 'undefined') {
            submitSelector = '.submitvalue';
        }
        $parent.find(submitSelector).each(function() {
            var $input = $(this);
            var key = $input.data('key');
            if (typeof (key) == 'undefined') {
                key = $input.attr('name');
            }
            var value = $input.val();
            if (typeof (value) == 'undefined') {
                value = $input.text();
            }
            values[key] = value;
        });
        return values;
    },
    /**
     * 向父元素下所有的数组导入数据，通过data-key/name表示提交的key
     * @param {type} $parent
     * @param {type} values
     * @param {type} submitSelector
     * @returns {undefined}
     */
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
    /**
     * 重置
     * @param {type} $parent
     * @param {type} submitSelector
     * @returns {undefined}
     */
    resetValues: function($parent, submitSelector) {
        if (typeof (submitSelector) == 'undefined') {
            submitSelector = '.submitvalue';
        }
        $parent.find(submitSelector).each(function() {
            var $input = $(this);
            $input.val('');
        });
    },
    /**
     * 通过object创建select的options代码
     * @param {Dictionary} map 字典
     * @param {string} defaultText 默认选项文字
     * @param {Array} selected 已选择的选项，数组表示，可多选
     * */
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
    /**
     * 通过树形结构创建select的options代码，可带缩进
     * @param {type} tree
     * @param {type} defaultText
     * @param {type} valueKey
     * @param {type} textKey
     * @param {type} indentText
     * @returns {String}
     */
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
    /**
     * 通过object创建checkboxs代码
     * @param {type} map
     * @param {type} attrHtml
     * @returns {String}
     */
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
    /**
     * 获取所有checkbox的数值
     * @param {type} $items
     * @returns {Array|Mx.form.getCheckboxValue.ret}
     */
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
    /**
     * 获取所有radio的数值
     * @param {type} $items
     * @returns {Array|Mx.form.getCheckboxValue.ret}
     */
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
/**
 * 解析json字符串，类似JSON.parse
 * @param {type} str
 * @returns {Function}
 */
Mx.json.toObject = function(str) {
    return (new Function("return " + str))();
};

Mx.namespace('Mx.browser');
/**
 * 支持在WebBrowser控件中的alert提示信息
 * @param {type} message
 * @returns {unresolved}
 */
Mx.browser.alert = function(message) {
    var domain = window;
    if (navigator.userAgent.indexOf('OpenWebKitSharp') >= 0) {
        domain = window.external;
    }
    return domain.alert(message);
};

/***
 * 关闭窗口
 * @returns {undefined}
 */
Mx.browser.closeWindow = function() {
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
            window.opener = null;
            window.close();
        } else {
            window.open('', '_top');
            window.top.close();
        }
    } else if (navigator.userAgent.indexOf("Firefox") > 0) {
        window.location.href = 'about:blank ';
        //window.history.go(-2);  
    } else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
    }
};


/**  
 * each是一个集合迭代函数，它接受一个函数作为参数和一组可选的参数  
 * 这个迭代函数依次将集合的每一个元素和可选参数用函数进行计算，并将计算得的结果集返回  
 {%example  
 <script>  
 var a = [1,2,3,4].each(function(x){return x > 2 ? x : null});  
 var b = [1,2,3,4].each(function(x){return x < 0 ? x : null});  
 alert(a);  
 alert(b);  
 </script>  
 %}  
 * @param {Function} fn 进行迭代判定的函数  
 * @param more ... 零个或多个可选的用户自定义参数  
 * @returns {Array} 结果集，如果没有结果，返回空集  
 */
Array.prototype.each = function(fn) {
    fn = fn || Function.K;
    var a = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < this.length; i++) {
        var res = fn.apply(this, [this[i], i].concat(args));
        if (res != null)
            a.push(res);
    }
    return a;
};

/**  
 * 得到一个数组不重复的元素集合<br/>  
 * 唯一化一个数组  
 * @returns {Array} 由不重复元素构成的数组  
 */
Array.prototype.uniquelize = function() {
    var ra = new Array();
    for (var i = 0; i < this.length; i++) {
        if (!ra.contains(this[i])) {
            ra.push(this[i]);
        }
    }
    return ra;
};

/**  
 * 求两个集合的补集  
 {%example  
 <script>  
 var a = [1,2,3,4];  
 var b = [3,4,5,6];  
 alert(Array.complement(a,b));  
 </script>  
 %}  
 * @param {Array} a 集合A  
 * @param {Array} b 集合B  
 * @returns {Array} 两个集合的补集  
 */
Array.complement = function(a, b) {
    return Array.minus(Array.union(a, b), Array.intersect(a, b));
};

/**  
 * 求两个集合的交集  
 {%example  
 <script>  
 var a = [1,2,3,4];  
 var b = [3,4,5,6];  
 alert(Array.intersect(a,b));  
 </script>  
 %}  
 * @param {Array} a 集合A  
 * @param {Array} b 集合B  
 * @returns {Array} 两个集合的交集  
 */
Array.intersect = function(a, b) {
    return a.uniquelize().each(function(o) {
        return b.contains(o) ? o : null
    });
};

/**  
 * 求两个集合的差集  
 {%example  
 <script>  
 var a = [1,2,3,4];  
 var b = [3,4,5,6];  
 alert(Array.minus(a,b));  
 </script>  
 %}  
 * @param {Array} a 集合A  
 * @param {Array} b 集合B  
 * @returns {Array} 两个集合的差集  
 */
Array.minus = function(a, b) {
    return a.uniquelize().each(function(o) {
        return b.contains(o) ? null : o
    });
};

/**  
 * 求两个集合的并集  
 {%example  
 <script>  
 var a = [1,2,3,4];  
 var b = [3,4,5,6];  
 alert(Array.union(a,b));  
 </script>  
 %}  
 * @param {Array} a 集合A  
 * @param {Array} b 集合B  
 * @returns {Array} 两个集合的并集  
 */
Array.union = function(a, b) {
    return a.concat(b).uniquelize();
};

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

/**
 * 类似C#的字符串格式化函数
 * var a = "我喜欢吃{0}，也喜欢吃{1}，但是最喜欢的还是{0},偶尔再买点{2}";
 * alert(String.format(a, "苹果","香蕉","香梨"));
 * @returns {String.format.str}
 */
String.format = function() {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

// Polyfill
(function() {

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

    if (!Array.prototype.contains) {
        Array.prototype.contains = function(ele) {
            return (this.indexOf(ele) >= 0);
        }
    }

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

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
    if (!Object.values) {
        Object.values = (function() {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(obj[prop]);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(obj[dontEnums[i]]);
                        }
                    }
                }
                return result;
            };
        }());
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
    if (!Object.keys) {
        Object.keys = (function() {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }
})();

