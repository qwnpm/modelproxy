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
const interface_factory_1 = require("./interface.factory");
const engine_factory_1 = require("./engine.factory");
const compose_1 = require("./compose");
const errors_1 = require("./errors");
class ModelProxy extends compose_1.Compose {
    constructor() {
        super(...arguments);
        this.interfaces = {};
    }
    addEngines(engines) {
        for (let key in engines) {
            if (engines.hasOwnProperty(key)) {
                engine_factory_1.engineFactory.add(key, engines[key], true);
            }
        }
        return this;
    }
    loadConfig(config, overrideInterfaceConfig) {
        this.interfaces[config.key] = this.initInterfaces(config, overrideInterfaceConfig);
        return this;
    }
    execute(ns, key, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const interfaces = this.getNs(ns), instance = interfaces.get(key);
            if (!instance) {
                throw new errors_1.ModelProxyMissingError(`没有发现/${ns}/${key}的接口方法！`);
            }
            return instance.execute(options);
        });
    }
    executeAll(inters) {
        return __awaiter(this, void 0, void 0, function* () {
            const maps = [];
            if (!inters || !Object.keys(inters).length) {
                return new Promise((resolve) => {
                    resolve(null);
                });
            }
            Object.keys(inters).forEach((key) => {
                maps.push(inters[key]().then((data) => {
                    return {
                        [key]: data
                    };
                }));
            });
            return Promise.all(maps).then((data) => {
                return data.reduce((prev, next) => {
                    return Object.assign({}, prev, next);
                });
            });
        });
    }
    race(inters) {
        return __awaiter(this, void 0, void 0, function* () {
            const maps = inters.map((inter) => {
                if (inter.then) {
                    return inter;
                }
                const { ns = "", key = "", options = {} } = inter;
                return this.execute(ns, key, options);
            });
            return Promise.race(maps);
        });
    }
    getNs(ns) {
        if (!this.interfaces.hasOwnProperty(ns)) {
            let nses = [];
            for (let key in this.interfaces) {
                if (this.interfaces.hasOwnProperty(key)) {
                    let element = this.interfaces[key];
                    nses.push(key);
                }
            }
            throw new errors_1.ModelProxyMissingError(`没有找到${ns}空间;当前命名空间【${nses.join(",")}】`);
        }
        return this.interfaces[ns];
    }
    minix(ns, ...keys) {
        if (!keys.length) {
            throw new errors_1.ModelProxyMissingError(`必须制定至少一个Key！`);
        }
        const interfaces = this.getNs(ns), idKeys = [], lastKey = keys.pop(), lastInterface = interfaces.get(lastKey);
        if (!lastInterface) {
            return null;
        }
        keys.forEach((k) => {
            let instance = interfaces.get(k);
            if (!instance) {
                throw new errors_1.ModelProxyMissingError(`${k}不存在于空间${ns}！`);
            }
            idKeys.push(instance);
        });
        return (...ids) => {
            if (ids.length !== idKeys.length) {
                throw new Error(`传入的参数个数不正确！`);
            }
            let paths = [];
            idKeys.forEach((k, idx) => {
                paths.push(k.replacePath({
                    instance: {
                        path: k.path + "/:" + k.key
                    },
                    params: {
                        [k.key]: ids[idx]
                    }
                }));
            });
            lastInterface.path = paths.concat([lastInterface.path]).join("");
            return lastInterface;
        };
    }
    initInterfaces(config, overrideInterfaceConfig = {}) {
        let ifFactory = new interface_factory_1.InterfaceFactory();
        config.interfaces.forEach((i) => {
            ifFactory.add(i.key, Object.assign({}, {
                engine: config.engine,
                mockDir: config.mockDir,
                ns: config.key,
                state: config.state,
                states: config.states,
            }, i, overrideInterfaceConfig || {}));
        });
        return ifFactory;
    }
}
exports.ModelProxy = ModelProxy;
