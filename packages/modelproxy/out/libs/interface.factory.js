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
const base_factory_1 = require("./base.factory");
const engine_factory_1 = require("./engine.factory");
class InterfaceFactory extends base_factory_1.BaseFactory {
    constructor() { super(); }
    add(name, instance, override = false) {
        super.add(name, instance, override);
        Object.assign(instance, {
            delete: this.custom.bind(this, instance, "DELETE"),
            execute: this.execute.bind(this, instance),
            get: this.custom.bind(this, instance, "GET"),
            getFullPath: this.getFullPath.bind(this, instance),
            getPath: this.getPath.bind(this, instance),
            post: this.custom.bind(this, instance, "POST", null),
            put: this.custom.bind(this, instance, "PUT"),
            replacePath: this.replacePath.bind(this, instance)
        });
    }
    execute(instance, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let engine;
            let iinstance;
            let { instance: extraInstance = {} } = options;
            iinstance = this.megreInstance(instance, extraInstance);
            engine = engine_factory_1.engineFactory.use(iinstance.engine);
            try {
                yield engine.validate(iinstance, options);
            }
            catch (e) {
                throw e;
            }
            return engine.proxy(iinstance, options);
        });
    }
    custom(instance, type, id, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let { instance: extraInstance = {}, params = {} } = options, iiinstance;
            extraInstance.method = type;
            if (id) {
                extraInstance.path = (extraInstance.path || instance.path) + "/:__id__";
                params.__id__ = id;
            }
            options.instance = extraInstance;
            options.params = params;
            return yield this.execute(instance, options);
        });
    }
    megreInstance(instance, extendInstance = {}) {
        return Object.assign({}, instance, extendInstance);
    }
    executeEngineMethod(instance, extendInstance = {}, method) {
        let engine, methodFunc, iinstance;
        iinstance = this.megreInstance(instance, extendInstance);
        engine = engine_factory_1.engineFactory.use("default");
        methodFunc = engine[method];
        if (methodFunc) {
            return methodFunc(instance, extendInstance);
        }
        return "";
    }
    getPath(instance, extendInstance = {}) {
        let engine, iinstance;
        iinstance = this.megreInstance(instance, extendInstance);
        return this.executeEngineMethod(instance, extendInstance, "getStatePath") + iinstance.path;
    }
    getFullPath(instance, options = {}) {
        return this.executeEngineMethod(instance, options.instance, "getFullPath");
    }
    replacePath(instance, options = {}) {
        return this.executeEngineMethod(instance, options.instance, "replacePath");
    }
}
exports.InterfaceFactory = InterfaceFactory;
