import { BaseEngine } from "modelproxy";
import { IInterfaceModel } from "modelproxy/out/models/interface";
export declare class FetchEngine extends BaseEngine {
    /**
     * 初始化中间件
     * 处理参数params，data，header等数据
     */
    init(): void;
    /**
     * 调用接口代理方法
     * @param instance 接口的信息
     * @param options  调用接口的参数
     */
    proxy(instance: IInterfaceModel, options: any): Promise<any>;
}
