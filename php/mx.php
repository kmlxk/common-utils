<?php

class Mx {

    public static function getGuid($pure = true) {
        if (function_exists('com_create_guid')) {
            $guid = com_create_guid();
            if ($pure) {
                $guid = str_replace(array('{', '}', '-'), "", $guid);
            }
            return $guid;
        } else {
            $charid = strtoupper(md5(uniqid(rand(), true)));
            if ($pure) {
                return $charid;
            }
            $hyphen = chr(45); // "-"
            $uuid = chr(123)// "{"
                    . substr($charid, 0, 8) . $hyphen
                    . substr($charid, 8, 4) . $hyphen
                    . substr($charid, 12, 4) . $hyphen
                    . substr($charid, 16, 4) . $hyphen
                    . substr($charid, 20, 12)
                    . chr(125); // "}"
            return $uuid;
        }
    }

    /**
     * 将\uXXXX这样的转义字符转换回非转义编码
     */
    public static function decodeUnicode($str) {
        $fn = create_function('$matches', 'return mb_convert_encoding(pack("H*", $matches[1]), "UTF-8", "UCS-2BE");');
        return preg_replace_callback('/\\\\u([0-9a-f]{4})/i', $fn, $str);
    }

    /**
     * 将日期字符串格式05:12:01转换为时间类型
     */
    public static function getTimeStamp($dt) {
        $year = 1970;
        $month = 1;
        $day = 1;
        $hour = 0;
        $min = 0;
        $sec = 0;
        $datetime = explode(' ', $dt);
        $sep = explode('-', $datetime[0]);
        if (count($sep) >= 1)
            $year = intval($sep[0]);
        if (count($sep) >= 2)
            $month = intval($sep[1]);
        if (count($sep) >= 3)
            $day = intval($sep[2]);
        if (count($datetime) >= 2) {
            $sep = explode(':', $datetime[1]);
            if (count($sep) >= 1)
                $hour = intval($sep[0]);
            if (count($sep) >= 2)
                $min = intval($sep[1]);
            if (count($sep) >= 3)
                $sec = intval($sep[2]);
        }
        return mktime($hour, $min, $sec, $month, $day, $year);
    }

    /**
     * 将日期字符串格式2009-11-27转换为时间类型
     */
    public static function getDateStamp($dt) {
        $year = 1970;
        $month = 1;
        $day = 1;
        $datetime = explode(' ', $dt);
        $sep = explode('-', $datetime[0]);
        if (count($sep) >= 1)
            $year = intval($sep[0]);
        if (count($sep) >= 2)
            $month = intval($sep[1]);
        if (count($sep) >= 3)
            $day = intval($sep[2]);
        return mktime(0, 0, 0, $month, $day, $year);
    }

    public static function httpUpload($url, $filename) {
        $ch = curl_init();
//加@符号curl就会把它当成是文件上传处理
        $data = array('img' => '@' . $filename);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }

    public static function httpPost($url, $data = null) {
        if (is_array($data)) {
            ksort($data);
            $content = http_build_query($data);
            $content_length = strlen($content);
            $options = array(
                'http' => array(
                    'method' => 'POST',
                    'header' =>
                    "Content-type: application/x-www-form-urlencoded\r\n" .
                    "Content-length: $content_length\r\n",
                    'content' => $content
                )
            );
            return file_get_contents($url, false, stream_context_create($options));
        } else if (is_string($data)) {
            $content = $data;
            $content_length = strlen($content);
            $options = array(
                'http' => array(
                    'method' => 'POST',
                    'header' =>
                    "Content-type: application/x-www-form-urlencoded\r\n" .
                    "Content-length: $content_length\r\n",
                    'content' => $content
                )
            );
            return file_get_contents($url, false, stream_context_create($options));
        }
        return file_get_contents($url);
    }

    public static function getDateTimeStr($timestamp) {
        if (intval($timestamp) > 0)
            return date('Y-m-d H:i:s', $timestamp);
        else
            return '';
    }

    public static function getDateStr($timestamp) {
        if (intval($timestamp) > 0)
            return date('Y-m-d', $timestamp);
        else
            return '';
    }

    public static function getTimeStr($timestamp) {
        if (intval($timestamp) > 0)
            return date('H:i:s', $timestamp);
        else
            return '';
    }

    public static function getUuid() {
        $uuid = strtoupper(md5(uniqid(mt_rand(), true)));
        return $uuid;
    }

    public static function getServerUrl() {
        return 'http://' . $_SERVER['HTTP_HOST'];
    }

    public static function getContextUrl() {
        return 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
    }

    /**
     * 获取IP地址
     */
    public static function getIp() {
        static $ip = false;
        if ($ip !== false)
            return $ip;
        foreach (array(
    'HTTP_CLIENT_IP',
    'HTTP_X_FORWARDED_FOR',
    'HTTP_X_FORWARDED',
    'HTTP_FORWARDED_FOR',
    'HTTP_FORWARDED',
    'REMOTE_ADDR') as $aah) {
            if (!isset($_SERVER[$aah]))
                continue;
            $ips = $_SERVER[$aah];
            $curip = explode('.', $ips);
            if (count($curip) !== 4)
                break; // If they've sent at least one invalid IP, break out
            foreach ($curip as &$sup)
                if (($sup = intval($sup)) < 0 or $sup > 255)
                    break 2;
            $curip_bin = $curip[0] << 24 | $curip[1] << 16 | $curip[2] << 8 | $curip[3];
            foreach (array(
// hexadecimal ip ip mask
        array(0x7F000001, 0xFFFF0000), // 127.0.*.*
        array(0x0A000000, 0xFFFF0000), // 10.0.*.*
        array(0xC0A80000, 0xFFFF0000), // 192.168.*.*
            ) as $ipmask) {
                if (($curip_bin & $ipmask[1]) === ($ipmask[0] & $ipmask[1]))
                    break 2;
            }
            return $ip = $ips;
        }
        return $ip = $_SERVER['REMOTE_ADDR'];
    }

    public static function getContextPath() {
        $path = $_SERVER['PHP_SELF'];
        $pos = strrpos($path, '/');
        if ($pos >= 0) {
            return substr($path, 0, $pos + 1);
        } else {
            return $path;
        }
    }

    public static function buildJsonMessage($success = true, $message = '', $data = null) {
        return array(
            'success' => $success,
            'message' => $message,
            'data' => $data,
        );
    }

    public static function getRequest($key, $default = null) {
        return isset($_REQUEST[$key]) ? $_REQUEST[$key] : $default;
    }

    public static function getRequests($keys, $default = null, $ignoreNull = true) {
        $ret = array();
        if (is_string($keys)) {
            $keys = explode(',', $keys);
        }
        $keys = array_map('trim', $keys);
        foreach ($keys as $key) {
            $val = Mx::getRequest($key, $default);
            if ($ignoreNull && $val == null) {
                
            } else {
                $ret[$key] = $val;
            }
        }
        return $ret;
    }

    public function init() {
        $this->req = array();
        $this->req['r'] = (!empty($_REQUEST['r']) ? (string) ($_REQUEST['r']) : 'default/index');
        $ar = explode('/', $this->req['r']);
        $this->req['ctrl'] = (!empty($ar[0]) ? (string) ($ar[0]) : 'default');
        $this->req['act'] = (!empty($ar[1]) ? (string) ($ar[1]) : 'index');
        $this->req['baseuri'] = str_replace('/index.php', '', $_SERVER['PHP_SELF']);
    }

    public function dispatch() {
        $class_name = $this->req['ctrl'] . '_controller';
        if (!class_exists($class_name, false)) {
            echo 'undefined controller';
            return;
        }
        $ctrl = new $class_name;
        $act = 'action' . $this->req['act'];
        if (method_exists($ctrl, $act)) {
            global $__DEBUG__;
            $__DEBUG__ = intval(Mx::getRequest('debug', 0));
            $response = $ctrl->$act();
            if (empty($response['viewname'])) {
                $response['viewname'] = $this->req['act'];
            }
            $viewfile = 'view' . DS . $this->req['ctrl'] . DS . $response['viewname'] . '.php';
            if (is_file($viewfile)) {
                extract($response);
                require($viewfile);
            }
        } else {
            echo 'undefined action';
            return;
        }
    }

}
