"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const modelproxy_1 = require("modelproxy");
const fetch = require("isomorphic-fetch");
const fetch_cache_1 = require("./fetch.cache");
const fetch_decorator_1 = require("./fetch.decorator");
const defaultHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
};
class FetchEngine extends modelproxy_1.BaseEngine {
    /**
     * 初始化中间件
     * 处理参数params，data，header等数据
     */
    init() {
        this.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            let formData = new FormData(), bodyParams = new URLSearchParams(), { executeInfo = {}, instance = {} } = ctx, body, headers = { "X-Requested-With": "XMLHttpRequest" }, { timeout = 5000, headers: originHeaders = {}, type = "", fetch: fetchOptions = {} } = executeInfo.settings || {}, fullPath = this.getFullPath(instance, executeInfo);
            // 根据type来设置不同的header
            switch (type) {
                case "params":
                    headers = Object.assign({}, defaultHeaders, headers);
                    body = bodyParams;
                    break;
                case "formdata":
                    body = formData;
                    break;
                default:
                    headers = Object.assign({}, defaultHeaders, headers);
                    body = JSON.stringify(executeInfo.data || {});
                    break;
            }
            headers = Object.assign({}, headers || {}, originHeaders);
            for (const key in executeInfo.data) {
                if (executeInfo.data.hasOwnProperty(key)) {
                    let data = executeInfo.data[key];
                    formData.append(key, data);
                    bodyParams.append(key, data);
                }
            }
            const fetchFunc = fetch.bind(fetch, fullPath, Object.assign({}, {
                body: ["GET", "OPTIONS", "HEAD"].indexOf(instance.method.toUpperCase()) === -1 ? body : null,
                credentials: "same-origin",
                headers: headers,
                method: instance.method,
            }, fetchOptions));
            // 发送请求
            ctx.result = yield fetch_decorator_1.fetchDec(fetch_cache_1.fetchCacheDec(fetchFunc, executeInfo, fullPath), timeout);
            yield next();
        }));
    }
    /**
     * 调用接口代理方法
     * @param instance 接口的信息
     * @param options  调用接口的参数
     */
    proxy(instance, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fn = this.callback(() => {
                // console.log();
            });
            const ctx = {
                executeInfo: options,
                instance: instance,
            };
            yield fn(ctx);
            if (ctx.isError) {
                throw ctx.err;
            }
            return ctx.result;
        });
    }
}
exports.FetchEngine = FetchEngine;
//# sourceMappingURL=fetch.engine.js.map