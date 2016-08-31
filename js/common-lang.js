
ArrayHelper = function () { };
/**
* 搜索二维数组中某一字段field=值value的行
* @param arr 二维数组
* @param field 字段field
* @param value 值value
*/
ArrayHelper.searchField = function (arr, field, value) {
    var i = 0;
    for (i = 0; i < arr.length; i++) {
        if (arr[i][field] == value) {
            return arr[i];
        }
    }
    return null;
}


String.prototype.trim = function(){
	if(!$.isFunction(this.replace)) {
		return null;
	}
	return this.replace(/^\s+|\s+$/g,"")
};
String.prototype.ltrim = function(){
	if(!$.isFunction(this.replace)) {
		return null;
	}
	return this.replace(/^\s+/g,"")
};
String.prototype.rtrim = function(){
	if(!$.isFunction(this.replace)) {
		return null;
	}
	return this.replace(/\s+$/g,"")
};
// 返回字符的长度，一个中文算2个
String.prototype.ChineseLength=function() {
	if(!$.isFunction(this.replace)) {
		return null;
	}
	return this.replace(/[^\x00-\xff]/g,"**").length;
};
// 判断字符串是否以指定的字符串结束
String.prototype.endsWith = function(str) {
	return this.substr(this.length - str.length) == str;
};
// 判断字符串是否以指定的字符串开始
String.prototype.startsWith = function(str) {
	return this.substr(0, str.length) == str;
};
/** * 获取字符串的哈希值 
* @param {String} str 
* @param {Boolean} caseSensitive 
* @return {Number} hashCode 
*/
//等同于java中的hashCode();
//效率挺高的
String.prototype.hashCode = function () {
    var hash = 0,
        str = this;
    if (str === undefined || str.length == 0)
        return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer  ( javascript中的int值和java中有区别 )
    }
    return hash;
};

String.prototype.lowerFirstChar = function () {
    var str = this;
    if (str == undefined || str.length == 0) {
        return str;
    }
    return str.substr(0, 1).toLowerCase() + str.substr(1);
}

/**
 * 时间对象的格式化;
 */
Date.prototype.format = function(format) {
    /*
     * eg:format="YYYY-MM-dd hh:mm:ss";
     */
    var o = {
        //"y+" :this.getFullYear() + 1, // year
        "M+" :this.getMonth() + 1, // month
        "d+" :this.getDate(), // day
        "h+" :this.getHours(), // hour
        "m+" :this.getMinutes(), // minute
        "s+" :this.getSeconds(), // second
        "q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
        "S" :this.getMilliseconds()
    // millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
    }

    for ( var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

// 二维表是一种常见数据，例如datagrid.rows
DataTableHelper = {
	// 动态的复制一列
    copyField: function (rows, column, newColumn) {
        for (var i in rows) {
            rows[i][newColumn] = rows[i][column];
        }
        return rows;
    }
};

// 对象编码为URL
function Object2UrlEncoding(param, key) {
    var paramStr="";
    if (param instanceof String||
		param instanceof Number||
		param instanceof Boolean){
        paramStr+="&"+key+"="+encodeURIComponent(param);
    } else {
        $.each(param,function(i){
            var k=key==null?i:key+(param instanceof Array?"["+i+"]":"."+i);
            paramStr+='&'+ Object2UrlEncoding(this, k);
        });
    }
    return paramStr.substr(1);
}

// NameValuePair编码为URL
function NameValueToUrlEncoding(kvs) {
    var ret = "",
		k = null,
		i = 0,
		kv = null;
	for (i = 0; i < kvs.length; i++) {
		kv = kvs[i];
		ret += kv['name'] + "=" + encodeURIComponent(kv['value']);
		if (i != kvs.length - 1) {
			ret += "&";
		}
	}
	return ret;
}

// NameValuePair转换为Dict
function FormArray2Dict(kvs) {
    var ret = {},
		k = null,
		i = 0,
		kv = null;
	for (i = 0; i < kvs.length; i++) {
	    kv = kvs[i];
	    if (typeof (ret[kv['name']]) == 'undefined') {
	        ret[kv['name']] = kv['value'];
	    } else {
	        ret[kv['name']] += "," + kv['value'];
        }
		
	}
	return ret;
}

// 填充表单
// 废弃：原本用于easyui.form填充表单
// 请改用$('form').form('load', kvs);
function fillFields($parent, kvs) {
	var k = null,
		$item = null;
	for (k in kvs) {
		$item = $parent.find('[name='+k+']');
		if ($item.hasClass('combo-value')) {
			$item.parent().find('input.combo-text').val(kvs[k]);
			$item.val(kvs[k]);
		} else {
			$item.val(kvs[k]);
		}
	}
}

// 给IE用的调试函数
function ie_dump(kv) {
	var ret = [];
	if (typeof(kv) == 'object') {
		for (var k in kv) {
			ret.push(k + ': ' + ie_dump(kv[k]));
		}
		return "{"+ret.join(',')+"}";
	} else if (typeof(kv) == 'array') {
		for (var k in kv) {
			ret.push(ie_dump(kv[k]));
		}
        return "[" + ret.join(',') + "]";
    } else if (typeof (kv) == 'function') {
        return "[function]";
    } else {
		return kv;
	}
	return kv
}

Number.prototype.toFixed = function(fractionDigits){
	var frac = Math.pow(10,fractionDigits);
	return Math.round(this*frac)/frac;
}

function getGlobal() {
	if (typeof (window) != 'undefined') {
		return window;
	}
	return this;
}
function isDefined(names, undefined) {
	var sep = names.split('.'),
	i,
	scope = getGlobal();
	for (i = 0; i < sep.length; i++) {
		if (scope[sep[i]] === undefined) {
			return false;
		}
		scope = scope[sep[i]];
	}
	return true;
}

function waitDefine(variableName, fn, timeout) {
	if (typeof timeout == 'undefined') {
		timeout = 500;
	}
	if (isDefined(variableName)) {
		fn.call();
		return;
	}
	setTimeout(function () {
		waitDefine(variableName, fn, timeout);
	}, timeout);
}


Template = function(temp, data) {
	return temp.replace(/\{\$(.*?)\}/g,
	function($0, $1, $2, $3, D) {
		var A = $1.split('.'),
		F = A.slice(1).join('.'),
		e = D || data;
		return F ? arguments.callee($0, F, $2, $3, e[A[0]]) : (typeof(e[$1])=='undefined' || e[$1]==null? '' : e[$1]);
	});
};
