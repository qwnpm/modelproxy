"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modelproxy_1 = require("modelproxy");
const promiseFactory = new modelproxy_1.BaseFactory();
/**
 * 为fetch增加cache的功能
 * 返回新的promise
 * @param fetchPromise {Promise<any>} fetch的promise
 * @param options      {IExecute}     请求参数
 * @param fullPath     {string}       请求路径
 * @returns {Promise<any>}
 */
exports.fetchCacheDec = (fetchPromise, options, fullPath) => {
    const { cache = false } = options.settings || {}, { method = "" } = options.instance || {}, proKey = fullPath + method;
    if (!cache) {
        return fetchPromise();
    }
    const promiseInCache = promiseFactory.get(proKey);
    if (promiseInCache) {
        return promiseInCache;
    }
    promiseFactory.add(proKey, fetchPromise());
    return promiseFactory.get(proKey);
};
//# sourceMappingURL=fetch.cache.js.map