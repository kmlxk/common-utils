package com.thinkgem.jeesite.common.utils;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.security.MessageDigest;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

import oracle.sql.TIMESTAMP;

import com.google.common.collect.Maps;
import common.lang.regex.AbstractReplaceCallBack;
import common.lang.regex.RegexUtils;

public class MxUtils {

	private static final char SEPARATOR = '_';

	public static void main(String[] args) {
		// AppExException src = new AppExException();
		// src.set("excnum", "ttttttttttttttt");
		// ExcExc dest = (ExcExc) fillObject(new ExcExc(), src);
		// System.out.println(dest.toString());
		// TestBean bean = new TestBean();
		// bean.setId("11");
		// bean.setName("ss");
		// Map<String, Object> map = toHashMap(bean);
		// System.out.println(map);
		// TestBean obj = (TestBean) fromHashMap(map, TestBean.class);
		// System.out.println(obj);
		// System.out.println(obj.getName());
		// String template = "您有一个待处理异常，上报人：${postby}，上报时间：${postdate}";
		// Map<String, Object> map = Maps.newHashMap();
		// map.put("postby", "caoz");
		// map.put("postdate", "2015-06-23");
		// String msg = MxUtils.replaceParameters(template, map);
		// System.out.println(msg);
	}

	/**
	 * 将HashMap中的数据按字段名称对应填充到指定的类实例对象。
	 * 
	 * @param Map
	 *            <String, Object> map 包含原始数据的Map
	 * @param Class
	 *            cls 待转换的类型
	 * */
	public static Object fromHashMap(Map<String, Object> map, Class cls) {
		return fromHashMap(map, cls, null);
	}

	/**
	 * 将HashMap中的数据按字段名称对应填充到指定的类实例对象。
	 * 
	 * @param Map
	 *            <String, Object> map 包含原始数据的Map
	 * @param Class
	 *            cls 待转换的类型
	 * @param Object
	 *            obj 待填充的对象，为空则新建对象
	 * */
	public static Object fromHashMap(Map<String, Object> map, Class cls,
			Object obj) {
		if (obj == null) {
			try {
				obj = cls.newInstance();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		// 取出bean里的所有方法
		Method[] methods = cls.getMethods();
		for (int i = 0; i < methods.length; i++) {
			// 取方法名
			String methodName = methods[i].getName();
			// 取出方法的第一个参数类型
			Class[] parameterTypeClass = methods[i].getParameterTypes();
			if (parameterTypeClass.length != 1) {
				continue;
			}

			// 如果方法名没有以set开头的则退出本次for
			if (!methodName.startsWith("set")) {
				continue;
			}
			// 类型
			String parameterTypeName = parameterTypeClass[0].getSimpleName();
			try {

				// 去除set字段名称
				String fieldName = methodName.substring(3, 4).toLowerCase()
						+ methodName.substring(4);
				// 如果map里有该key
				if (map.containsKey(fieldName)) {
					// 调用其底层方法
					setValue(parameterTypeName, map.get(fieldName), i, methods,
							obj);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return obj;
	}

	/***
	 * 调用底层方法设置值
	 */
	private static void setValue(String type, Object value, int i,
			Method[] method, Object bean) {
		if (value != null && !value.equals("")) {
			try {
				if (type.equals("String")) {
					// 第一个参数:从中调用基础方法的对象 第二个参数:用于方法调用的参数
					method[i].invoke(bean, new Object[] { value });
				} else if (type.equals("int") || type.equals("Integer")) {
					method[i].invoke(bean, new Object[] { new Integer(""
							+ value) });
				} else if (type.equals("long") || type.equals("Long")) {
					method[i].invoke(bean,
							new Object[] { new Long("" + value) });
				} else if (type.equals("boolean") || type.equals("Boolean")) {
					method[i].invoke(bean,
							new Object[] { Boolean.valueOf("" + value) });
				} else if (type.equals("Date")) {
					Date date = null;
					if (value.getClass().getName().equals("java.util.Date")) {
						date = (Date) value;
					} else {
						String format = ((String) value).indexOf(":") > 0 ? "yyyy-MM-dd hh:mm"
								: "yyyy-MM-dd";
						date = parseDateTime("" + value, format);
					}
					if (date != null) {
						method[i].invoke(bean, new Object[] { date });
					}
				} else if (type.equals("byte[]")) {
					method[i].invoke(bean,
							new Object[] { new String(value + "").getBytes() });
				}
			} catch (Exception e) {
				System.out
						.println("将LinkedHashMap 或 HashTable 里的值填充到JavaBean时出错,请检查");
				if (bean != null && method[i] != null) {
					System.out.println(bean.getClass().getName() + "."
							+ method[i].getName());
				}
				e.printStackTrace();
			}
		}
	}

	public static Date parseDateTime(String dateValue, String format) {
		SimpleDateFormat obj = new SimpleDateFormat(format);
		try {
			return obj.parse(dateValue);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public static Map<String, Object> toHashMap(Object obj) {
		return toHashMap(obj, false, new String[] {}, true);
	}

	public static Map<String, Object> toHashMap(Object obj, String[] matches,
			boolean diff) {
		return toHashMap(obj, false, matches, diff);
	}

	/**
	 * 转换对象为HaspMap
	 * 
	 * @param Object
	 *            obj 待转换对象
	 * @param boolean recursive 是否递归转换
	 * @param String
	 *            [] matches 匹配属性名,
	 * @param boolean diff 计算差集
	 * */
	public static Map<String, Object> toHashMap(Object obj, boolean recursive,
			String[] matches, boolean diff) {

		if (obj == null) {
			return null;
		}
		Map<String, Object> map = new HashMap<String, Object>();
		List<String> matchList = Arrays.asList(matches);
		try {
			BeanInfo beanInfo = Introspector.getBeanInfo(obj.getClass());
			PropertyDescriptor[] propertyDescriptors = beanInfo
					.getPropertyDescriptors();
			for (PropertyDescriptor property : propertyDescriptors) {
				String key = property.getName();
				// 过滤class属性
				if (key.equals("class")) {
					continue;
				}
				if (matchList.contains(key)) {
					if (diff) {
						// 差集，排除某几个字段
						continue;
					} else {
						// 交集，只需要某几个字段
					}
				} else {
					if (diff) {
						// 差集，排除某几个字段
					} else {
						// 交集，只需要某几个字段
						continue;
					}
				}
				// 得到property对应的getter方法
				Method getter = property.getReadMethod();
				if (getter == null) {
					continue;
				}
				// System.out.println("[MxUtils.toHashMap]"
				// + obj.getClass().getName() + "." + getter.getName());
				try {
					Object value = getter.invoke(obj);
					// 递归转换HashMap
					if (value != null && recursive
							&& !obj.getClass().isPrimitive()
							&& !(value instanceof HashMap)) {
						value = toHashMap(value, true, new String[] {}, true);
					}
					map.put(key, value);
				} catch (IllegalAccessException e) {
				} catch (IllegalArgumentException e) {
				} catch (InvocationTargetException e) {
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return map;

	}

	public static String formatOracleTimestamp(TIMESTAMP t) {
		return formatOracleTimestamp(t, null);
	}

	public static String formatOracleTimestamp(TIMESTAMP t, String formatStr) {
		try {
			if (formatStr == null || formatStr.equals("")) {
				formatStr = "yyyy-MM-dd HH:mm:ss";
			}
			Timestamp tt;
			tt = t.timestampValue();
			Date date = new Date(tt.getTime());
			SimpleDateFormat sd = new SimpleDateFormat(formatStr);
			return sd.format(date);
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return "";
	}

	public final static String md5(String s) {
		char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
				'A', 'B', 'C', 'D', 'E', 'F' };

		try {
			byte[] btInput = s.getBytes();
			// 获得MD5摘要算法的 MessageDigest 对象
			MessageDigest mdInst = MessageDigest.getInstance("MD5");
			// 使用指定的字节更新摘要
			mdInst.update(btInput);
			// 获得密文
			byte[] md = mdInst.digest();
			// 把密文转换成十六进制的字符串形式
			int j = md.length;
			char str[] = new char[j * 2];
			int k = 0;
			for (int i = 0; i < j; i++) {
				byte byte0 = md[i];
				str[k++] = hexDigits[byte0 >>> 4 & 0xf];
				str[k++] = hexDigits[byte0 & 0xf];
			}
			return new String(str);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * 获取现在时间
	 * 
	 * @return返回字符串格式 yyyy-MM-dd HH:mm:ss
	 */
	public static String getDateString() {
		return getDateString(new Date(), "yyyy-MM-dd HH:mm:ss");
	}

	public static String getDateString(Date date) {
		return getDateString(date, "yyyy-MM-dd HH:mm:ss");
	}

	public static String getDateString(Date date, String format) {
		SimpleDateFormat formatter = new SimpleDateFormat(format);
		String ret = formatter.format(date);
		return ret;
	}

	public static void dumpObject(Object obj) {
		Class<?> clazz = obj.getClass();
		Method method[] = clazz.getMethods();
		Field fields[] = clazz.getFields();
		for (int i = 0; i < method.length; ++i) {
			System.out.println(method[i].getName() + "()");
		}
		for (int i = 0; i < fields.length; ++i) {
			System.out.println(fields[i].getName() + " = ");
		}
	}

	/**
	 * 从ActiveJDBC Model实体类转换为POJO类 遍历POJO的setter，获取ActiveJDBC Model的字段值，并设置
	 * */
	public static Object fillObject(Object destObj, Object srcObj) {
		Class<?> srcClazz = srcObj.getClass();
		Class<?> destClazz = destObj.getClass();
		Method destMethod[] = destClazz.getMethods();
		Method getMethod = null;
		try {
			// ActiveJDBC的Model实体类有get(propName)方法可以获取字段值
			getMethod = srcClazz.getMethod("get", (new String()).getClass());
		} catch (NoSuchMethodException e) {
		} catch (SecurityException e) {
		}
		if (getMethod == null) {
			return null;
		}
		System.out.println("[MxUtils.fillObject]" + getMethod);
		for (int i = 0; i < destMethod.length; ++i) {
			String destMethodName = destMethod[i].getName();
			if (destMethodName.startsWith("set")) {
				System.out.println("[MxUtils.fillObject]" + destMethodName);
				try {
					// 在返回POJO中调用对应的setter设置字段值
					Object val;
					String propertyName = destMethodName.toLowerCase()
							.substring("set".length());
					// 调用ActiveJDBC的get(propName)方法获取字段值
					val = getMethod.invoke(srcObj, propertyName);
					// 调用POJO的setter设置字段值
					if (val instanceof TIMESTAMP) {
						val = MxUtils.fromOracleTimestamp((TIMESTAMP) val);
					}
					destMethod[i].invoke(destObj, new Object[] { val });
					System.out.println(propertyName + ": " + val + " ->"
							+ destMethodName);
				} catch (IllegalAccessException e) {
					e.printStackTrace();
				} catch (IllegalArgumentException e) {
					e.printStackTrace();
				} catch (InvocationTargetException e) {
					e.printStackTrace();
				}
			}
		}
		return destObj;
	}

	private static Date fromOracleTimestamp(TIMESTAMP timestamp) {
		String str = MxUtils.formatOracleTimestamp(timestamp);
		String format = "yyyy-MM-dd HH:mm:ss";
		SimpleDateFormat sd = new SimpleDateFormat(format);
		try {
			return sd.parse(str);
		} catch (ParseException e) {
		}
		return null;
	}

	public static Object invoke(Object obj, String methodname,
			Class<?>[] parameterTypes, Object[] parameters)
			throws NoSuchMethodException, SecurityException,
			IllegalAccessException, IllegalArgumentException,
			InvocationTargetException {
		Class<?> clazz = obj.getClass();
		Method method = clazz.getMethod(methodname, parameterTypes);
		return method.invoke(obj, parameters);
	}

	public static String getExtensionName(String filename) {
		if ((filename != null) && (filename.length() > 0)) {
			int dot = filename.lastIndexOf('.');
			if ((dot > -1) && (dot < (filename.length() - 1))) {
				return filename.substring(dot + 1);
			}
		}
		return filename;
	}

	public static String getUrlServer(String url) {
		int pos = url.indexOf("//");
		pos = url.indexOf("/", pos + 2);
		if (pos < 0) {
			return "";
		}
		return url.substring(0, pos);
	}

	public static List<String> listPreappend(List<String> list, String prefix) {
		for (int i = 0; i < list.size(); i++) {
			list.set(i, prefix + list.get(i));
		}
		return list;
	}

	public static String replaceParameters(String template,
			final Map<String, Object> map) {
		String ret = RegexUtils.replaceAll(template, "\\$\\{([\\w_]+)\\}",
				new AbstractReplaceCallBack() {
					@Override
					public String doReplace(String text, int index,
							Matcher matcher) {
						if (map.containsKey($(1))) {
							return (String) map.get($(1));
						}
						return "";
					}
				});
		return ret;
	}

	/**
	 * 将Map的字段名由下划线分隔转换为驼峰命名
	 * */
	public static Map<String, Object> toCamelCaseMap(Map<String, Object> from) {
		Map<String, Object> ret = Maps.newHashMap();
		for (Map.Entry<String, Object> entry : from.entrySet()) {
			ret.put(MxUtils.toCamelCase(entry.getKey()), entry.getValue());
		}
		return ret;
	}

	/**
	 * 驼峰命名转换为下划线分隔 toUnderScoreCase("helloWorld") = "hello_world"
	 * */
	public static String toUnderlineName(String s) {
		if (s == null) {
			return null;
		}

		StringBuilder sb = new StringBuilder();
		boolean upperCase = false;
		for (int i = 0; i < s.length(); i++) {
			char c = s.charAt(i);

			boolean nextUpperCase = true;

			if (i < (s.length() - 1)) {
				nextUpperCase = Character.isUpperCase(s.charAt(i + 1));
			}

			if ((i >= 0) && Character.isUpperCase(c)) {
				if (!upperCase || !nextUpperCase) {
					if (i > 0)
						sb.append(SEPARATOR);
				}
				upperCase = true;
			} else {
				upperCase = false;
			}

			sb.append(Character.toLowerCase(c));
		}

		return sb.toString();
	}

	/**
	 * 下划线分隔转换为驼峰命名 toCamelCase("hello_world") == "helloWorld"
	 * */
	public static String toCamelCase(String s) {
		if (s == null) {
			return null;
		}

		s = s.toLowerCase();

		StringBuilder sb = new StringBuilder(s.length());
		boolean upperCase = false;
		for (int i = 0; i < s.length(); i++) {
			char c = s.charAt(i);

			if (c == SEPARATOR) {
				upperCase = true;
			} else if (upperCase) {
				sb.append(Character.toUpperCase(c));
				upperCase = false;
			} else {
				sb.append(c);
			}
		}

		return sb.toString();
	}

	/**
	 * 下划线分隔转换为首字母大写的驼峰命名 toCapitalizeCamelCase("hello_world") == "HelloWorld"
	 * */
	public static String toCapitalizeCamelCase(String s) {
		if (s == null) {
			return null;
		}
		s = toCamelCase(s);
		return s.substring(0, 1).toUpperCase() + s.substring(1);
	}

}
