'use strict';

var EVENT_LISTENER_START = 'on';
var TEXT_ELEMENT_TYPE = 'TEXT ELEMENT';

/**
 * @description
 * 对比更新dom的属性和事件，核心是最终 dom 的属性要和 nextProps保持一致，但不要重复删除添加
 * @param {Element | Text} 要更新的dom节点
 * @param {IFishtailElementProps} 该节点之前的props数据
 * @param {IFishtailElementProps} 该节点最新的props数据
 */
var updateDomProperties = function (dom, prevProps, nextProps) {
    var isNew = function (prev, next) { return function (key) {
        return prev[key] !== next[key];
    }; };
    Object.keys(prevProps).forEach(function (propName) {
        // 判断这个属性是不是被删除或者被修改
        if (!(propName in nextProps) || isNew(prevProps, nextProps)(propName)) {
            if (propName.startsWith(EVENT_LISTENER_START)) {
                var eventName = propName.toLowerCase().slice(2);
                dom.removeEventListener(eventName, prevProps[propName]);
            }
            else if (propName !== 'children') {
                dom[propName] = null;
            }
        }
    });
    Object.keys(nextProps).forEach(function (propName) {
        // 判断这个属性是否为新增或者更新
        if (isNew(prevProps, nextProps)(propName)) {
            if (propName.startsWith(EVENT_LISTENER_START)) {
                var eventName = propName.toLowerCase().slice(2);
                dom.addEventListener(eventName, nextProps[propName]);
            }
            else if (propName !== 'children') {
                dom[propName] = nextProps[propName];
            }
        }
    });
};

/**
 * @description
 * 类组件的基础抽象类，实现基本的一些功能配置：
 * 1. props和state绑定
 * 2. setState更新状态
 * 3. 定义render抽象类方法
 */
var Component = /** @class */ (function () {
    function Component(props) {
        this.props = {};
        this.state = {};
        this.props = props;
        this.state = this.state;
    }
    Component.prototype.setState = function (modifieState) {
        this.state = Object.assign(this.state, modifieState);
        updateInstance(this.__internalInstance);
    };
    return Component;
}());
/**
 * @description
 * 调用组件实例生命周期的方法
 * @param {instance} instance 组件实例数据
 * @param {} lifecycleName 生命周期方法名
 */
var callClassComponentLifeCycle = function (instance, lifecycleName) {
    if (instance && instance.publicInstance) {
        if (instance.publicInstance[lifecycleName]) {
            return instance.publicInstance[lifecycleName]();
        }
    }
};
/**
 * @description
 * 通过实例上的内部实例数据，调用协调更新组件显示
 * @param {internalInstance} 组件内部实例数据
 */
var updateInstance = function (internalInstance) {
    var parentDom = internalInstance.dom.parentNode;
    var element = internalInstance.element;
    reconcile(parentDom, internalInstance, element);
};

// import { IFishtailInstance } from "./interface/IFishtailInstance";
/**
 * @description
 * 将传进来的VDOM进行实例化，实例化实际上就是把VDOM和真实DOM进行映射，方便操作
 * @param {IFishtailElement} element 想要实例化的VDOM，可能是DOM节点的也可能是类组件或者函数组件
 * @return {IFishtailInstance} element实例化后的内容
 */
var instantiate = function (element) {
    var type = element.type, props = element.props;
    if (typeof type === 'string') {
        // HTML节点
        var isTextELement = type === TEXT_ELEMENT_TYPE;
        var dom_1 = isTextELement ? document.createTextNode('') : document.createElement(type);
        updateDomProperties(dom_1, {}, props);
        var childELements = props.children || [];
        // 这里通过递归不断拿到下面每一层的 instance 结构，再通过后面的 append 操作生成出完整的 DOM 树
        var childInstances = childELements.map(instantiate);
        childInstances.forEach(function (childrenInstance) {
            dom_1.appendChild(childrenInstance.dom);
        });
        return { element: element, dom: dom_1, childInstances: childInstances };
    }
    else if (type.prototype instanceof Component) {
        // 类组件
        var instance = {};
        var publicInstance = createPublicInstance(element, instance); // 创建组件实例对象
        var childElement = publicInstance.render(); // 执行实例上的render方法
        var childInstance = instantiate(childElement); // 递归拿到子实例
        var dom = childInstance.dom; // 拿到整个dom
        Object.assign(instance, { dom: dom, element: element, childInstance: childInstance, publicInstance: publicInstance });
        return instance;
    }
    else {
        // 函数组件
        var childElement = type(props);
        // @ts-ignore
        var childInstance = instantiate(childElement);
        var dom = childInstance.dom;
        return { dom: dom, element: element, childInstance: childInstance };
    }
};
/**
 * @description
 * 生成类组件的对应公共实例，并且将该组件的instance数据绑定在实例上
 * @param {IFishtailElement} element
 */
var createPublicInstance = function (element, internalInstance) {
    var type = element.type, props = element.props;
    if (typeof type !== 'string') {
        // @ts-ignore
        var publicInstance = new type(props);
        publicInstance.__internalInstance = internalInstance;
        return publicInstance;
    }
};

var LifeCircleNameEnum;
(function (LifeCircleNameEnum) {
    LifeCircleNameEnum["willMount"] = "componentWillMount";
    LifeCircleNameEnum["didMount"] = "componentDidMount";
    LifeCircleNameEnum["receiveProps"] = "componentWillReceiveProps";
    LifeCircleNameEnum["shouldUpdate"] = "shouldComponentUpdate";
    LifeCircleNameEnum["willUpdate"] = "componentWillUpdate";
    LifeCircleNameEnum["didUpdate"] = "componentDidUpdate";
    LifeCircleNameEnum["willUnmount"] = "componentWillUnmount";
})(LifeCircleNameEnum || (LifeCircleNameEnum = {}));

/**
 * @description
 * 做节点更新，节点(DOM和组件)复用的基础上的DOM变化，如节点增删改，以及属性变化
 * @param {Element | Text} parentDom 正在进行协调的节点的父容器节点
 * @param {IFishtailInstance | null | undefined} instance 正在协调的节点的实例数据，包括相关dom信息和VDOM描述及子节点信息
 * @param {IFishtailElement | undefined} element 正在协调节点的最新描述信息 VDOM
 * @return {IFishtailInstance | null} 最新的节点实例数据
 */
var reconcile = function (parentDom, instance, element) {
    if (instance === null || instance === undefined) {
        if (element === undefined) {
            return null;
        } // <-------- 两个都没有就算了吧
        // 新增节点，做添加
        var newInstance = instantiate(element);
        callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.willMount);
        parentDom.appendChild(newInstance.dom);
        callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.didMount);
        return newInstance;
    }
    else if (element === undefined) {
        // 没有最新节点，做删除
        callClassComponentLifeCycle(instance, LifeCircleNameEnum.willUnmount);
        parentDom.removeChild(instance.dom);
        return null;
    }
    else if (instance.element.type !== element.type) {
        // 两边不同，都存在，做替换
        var newInstance = instantiate(element);
        callClassComponentLifeCycle(instance, LifeCircleNameEnum.willUnmount);
        callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.willMount);
        parentDom.replaceChild(newInstance.dom, instance.dom);
        callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.didMount);
        return newInstance;
    }
    else if (typeof element.type === 'string') {
        // 说明相同类型的type，可复用dom，继而修改原 dom 上的属性
        updateDomProperties(instance.dom, instance.element.props, element.props);
        instance.childInstances = reconcileChildren(instance, element);
        // dom 已更新至最新，Fishtail element保持同步
        instance.element = element;
        return instance;
    }
    else {
        var shouldUpdateStatus = callClassComponentLifeCycle(instance, LifeCircleNameEnum.shouldUpdate);
        if ([false, null, '', 0].includes(shouldUpdateStatus)) {
            return null;
        }
        callClassComponentLifeCycle(instance, LifeCircleNameEnum.willUpdate);
        var childElement = void 0;
        if (instance.publicInstance) {
            // 这一步实际上对修改了state的组件是没变化的，但是通过state绑定给子组件prop后，通过递归执行，子组件就能拿到最新的prop了
            instance.publicInstance.props = element.props;
            // 拿到组件最新的 element（因为既更新过state也更新过prop），这里通过render和state的改变都会变成新的element中
            childElement = instance.publicInstance.render();
        }
        else {
            // @ts-ignore
            childElement = element.type(element.props);
        }
        // 拿到过去的整个组件的子实例
        var oldChildInstance = instance.childInstance;
        // 对组件的前后状态做协调，最终打造新的一个 childInstance 更新，其实这里相当于把原先的rootInstance绑定在了组件自己内部
        // 组件最终会使用HTML型的element，所以会走到其它判断里，完成修改等操作
        var childInstance = reconcile(parentDom, oldChildInstance, childElement);
        if (!childInstance) {
            return null;
        }
        callClassComponentLifeCycle(instance, LifeCircleNameEnum.didUpdate);
        instance.dom = childInstance.dom; // 更新dom
        instance.childInstance = childInstance; // 更新childInstance
        instance.element = element; // 更新element
        return instance;
    }
};
/**
 * @description
 * 协调更新DOM节点的子节点信息，通过拿到最新的VDOM列表和之前的进行协调对比
 * @param {IFishtailInstance} 要更新其子节点的实例数据
 * @param {IFishtailElement} 要更新子节点的VDOM
 */
var reconcileChildren = function (instance, element) {
    var dom = instance.dom, _a = instance.childInstances, childInstances = _a === void 0 ? [] : _a;
    var nextChlidElements = element.props.children || [];
    var newChildInstances = [];
    var count = Math.max(childInstances.length, nextChlidElements.length);
    for (var i = 0; i < count; i++) {
        var childInstance = childInstances[i];
        var childElement = nextChlidElements[i];
        // 递归上一层的 reconcile 方法，实现深度 reconcile
        var newChildInstance = reconcile(dom, childInstance, childElement);
        newChildInstances.push(newChildInstance);
    }
    return newChildInstances.filter(function (instance) { return instance !== null && instance !== undefined; });
};

// 保存最新的根节点Instance数据
var rootInstance = null;
/**
 * @description
 * 1. 相当于 ReactDOM.render 方法
 * 2. 递归的把传进来的 fishtail 元素创建成真实的 DOM tree，绑定每个元素的props中事件和属性
 * 3. 将 DOM tree 添加到 parentDom 中
 * @param { IFishtailElement } element 一个 fishtail 元素类型
 * @param { Element } parentDom 要渲染的目标 dom 元素
 * @return { undefined }
 */
var render = function (element, parentDom) {
    var prevInstance = rootInstance;
    var nextInstace = reconcile(parentDom, prevInstance, element);
    // 记录最新的 根节点 实例
    rootInstance = nextInstace;
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/**
 * @description
 * 相当于 React.createElement 方法
 * 1. 该方法的目的是把 JSX 被编译的东西，利用该方法转换成一个 fishtail 元素
 * 2. 转换出的 fishtail 元素将可以在 render 中调用继而渲染到页面
 * @param { string } type 元素类型
 * @param { IFishtailElementProps } config 元素的属性集合
 * @param { Array<IFishtailElement|string> } childrenList 子元素的列表
 * @return { IFishtailElement } 一个 fishtail 元素
*/
var createElement = function (type, config) {
    var childrenList = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        childrenList[_i - 2] = arguments[_i];
    }
    var props = __assign({}, config);
    var finalChlidren = [];
    // @ts-ignore
    var rawChildren = [].concat.apply([], childrenList);
    rawChildren.forEach(function (children) {
        if (children !== null && children !== false && children !== undefined) {
            if (!(children instanceof Object)) {
                children = createTextElement(children);
            }
            finalChlidren.push(children);
        }
    });
    props.children = finalChlidren;
    return { type: type, props: props };
};
/**
 * @description
 * 当处理 JSX 时，遇到 text 文案类型时，需要特殊创建
 * @param { string | number } nodeValue 文案内容
 * @return { IFishtailElement } 最终也是返回一个文案类型的 fishtaile 元素
 */
var createTextElement = function (nodeValue) {
    return createElement(TEXT_ELEMENT_TYPE, { nodeValue: nodeValue });
};

var Fishtail = {
    render: render,
    createElement: createElement,
    Component: Component
};
// 最终打包的文件引入后可通过 Fishtail 全局变量使用
window.Fishtail = Fishtail;
//# sourceMappingURL=bundle.cjs.js.map
