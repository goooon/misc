//https://help.aliyun.com/document_detail/44435.html?spm=a2c4g.11186623.6.624.qRjqSk
var uuid = require('node-uuid');
var utf8 = require('utf8');
var crypto = require('crypto');
var http = require('http');
var moment = require('moment');
//账号AK信息请填写(必选)
access_key_id = "LTAIATyMu1j3xwYg";
//账号AK信息请填写(必选)
access_key_secret = "";
//STS临时授权方式访问时该参数为必选，使用主账号AK和RAM子账号AK不需要填写
security_token = "";
//以下参数不需要修改
VOD_DOMAIN = "http://vod.cn-shanghai.aliyuncs.com";
ISO8601_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
HTTP_METHOD = "GET";
HMAC_SHA1_ALGORITHM = "HmacSHA1";
UTF_8 = "utf-8";

function getAuthToken(){
    //生成私有参数，不同API需要修改
    privateParams = generatePrivateParamters("5aed81b74ba84920be578cdfe004af4b");
    //生成公共参数，不需要修改
    publicParams = generatePublicParamters();
    //生成OpenAPI地址，不需要修改
    URL = generateOpenAPIURL(publicParams, privateParams);
    //发送HTTP GET 请求
    httpGet(URL);
}
/**
 * 生成视频点播OpenAPI私有参数
 * 不同API需要修改此方法中的参数
 * @return
 */
function generatePrivateParamters(videoId) {
    // 接口私有参数列表, 不同API请替换相应参数
    var privateParams = new Map();
    // 视频ID
    privateParams.set("VideoId",videoId);
    // API名称
    privateParams.set("Action", "GetVideoPlayAuth");
    return privateParams;
}
/**
 * 生成视频点播OpenAPI公共参数
 * 不需要修改
 * @return
 */
function generatePublicParamters() {
    var publicParams = new Map();
    publicParams.set("Format", "JSON");
    publicParams.set("Version", "2017-03-21");
    publicParams.set("AccessKeyId", access_key_id);
    publicParams.set("SignatureMethod", "HMAC-SHA1");
    publicParams.set("Timestamp", generateTimestamp());
    publicParams.set("SignatureVersion", "1.0");
    publicParams.set("SignatureNonce", generateRandom());
    if (security_token != null && security_token.length > 0) {
        publicParams.set("SecurityToken", security_token);
    }
    return publicParams;
}
/**
 * 生成OpenAPI地址
 * @param privateParams
 * @return
 * @throws Exception
 */
function generateOpenAPIURL(publicParams,privateParams) {
    return generateURL(VOD_DOMAIN, HTTP_METHOD, publicParams, privateParams);
}
/**
 * @param domain        请求地址
 * @param httpMethod    HTTP请求方式GET，POST等
 * @param publicParams  公共参数
 * @param privateParams 接口的私有参数
 * @return 最后的url
 */
function generateURL(domain, httpMethod, publicParams, privateParams) {
    allEncodeParams = getAllParams(publicParams, privateParams);
    cqsString = getCQS(allEncodeParams);
    console.log("CanonicalizedQueryString = " + cqsString);
    stringToSign = httpMethod + "&" + percentEncode("/") + "&" + percentEncode(cqsString);
    console.log("StringtoSign = " + stringToSign);
    signature = hmacSHA1Signature(access_key_secret, stringToSign);
    console.log("Signature = " + signature);
    return domain + "?" + cqsString + "&" + percentEncode("Signature") + "=" + percentEncode(signature);
}

function getAllParams(publicParams, privateParams) {
    encodeParams = new Array();
    if (publicParams != null) {
        for (var key of publicParams.keys()){
            value = publicParams.get(key);
            //将参数和值都urlEncode一下。
            encodeKey = percentEncode(key);
            encodeVal = percentEncode(value);
            encodeParams.push(encodeKey + "=" + encodeVal);
        }
    }
    if (privateParams != null) {
        for (var key of privateParams.keys()) {
            value = privateParams.get(key);
            //将参数和值都urlEncode一下。
            encodeKey = percentEncode(key);
            encodeVal = percentEncode(value);
            encodeParams.push(encodeKey + "=" + encodeVal);
        }
    }
    return encodeParams;
}

/**
 * 参数urlEncode
 *
 * @param value
 * @return
 */
function percentEncode(value) {
    urlEncodeOrignStr = utf8.encode(encodeURIComponent(value));
    plusReplaced = urlEncodeOrignStr.replace("+", "%20");
    starReplaced = plusReplaced.replace("*", "%2A");
    waveReplaced = starReplaced.replace("%7E", "~");
    return waveReplaced;
}
/**
 * 获取CQS 的字符串
 *
 * @param allParams
 * @return
 */
function getCQS(allParams) {
    //ParamsComparator paramsComparator = new ParamsComparator();
    //Collections.sort(allParams, paramsComparator);
    allParams.sort();
    cqString = "";
    i = 0;
    for (; i < allParams.length - 1; ++ i) {
        cqString += allParams[i];
        cqString += "&";
    }
    cqString += allParams[i];
    return cqString;
}
function hmacSHA1Signature(accessKeySecret, stringtoSign) {
    key = accessKeySecret + "&";
    return crypto.createHmac('sha1', key).update(stringtoSign).digest().toString('base64');
}
/**
 * 生成随机数
 *
 * @return
 */
function generateRandom() {
    signatureNonce = uuid.v4();
    return signatureNonce;
}
/**
 * 生成当前UTC时间戳
 *
 * @return
 */
function generateTimestamp() {
    //return new Date(Date.now()).toISOString();
    return moment().format();
}
function httpGet(url){
    http.get(url,function(req,res){  
        var html='';  
        req.on('data',function(data){
            html+=data;  
        });  
        req.on('end',function(){  
            console.log(html);  
        });  
    });  
}
authToken = getAuthToken();
console.log(authToken);

/*
对视频点播服务接口的调用是通过向视频点播服务端发送HTTP请求（可以通过HTTP或HTTPS通道发送），并获取视频点播服务对该请求响应结果的过程。视频点播服务端在接收到用户请求后，对请求做必要的身份验证和参数验证，在所有验证成功后根据请求的指定参数提交或完成相应操作，并把处理的结果以HTTP响应的形式返回给调用者。

以下Java示例代码演示了如何添加公共参数和私有参数、如何构造用请求参数构造规范化请求字符串，如何构造stringToSign字符串，以及如何得到OpenAPI地址，最终以Get方式发送Http请求后得到相应响应。如果您需要使用以下示例，请替换示例中的必选参数及私有参数
*/
