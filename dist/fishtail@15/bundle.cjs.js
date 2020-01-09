'use strict';

var EVENT_LISTENER_START = 'on';
var TEXT_ELEMENT_TYPE = 'TEXT ELEMENT';

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
// 根据不同情况协调两个 dom tree，并做不同方式的渲染
var reconcile = function (parentDom, instance, element) {
    if (instance === null || instance === undefined) {
        if (element === undefined) {
            return null;
        } // <-------- 两个都没有就算了吧
        // 新增节点，做添加
        var newInstance = instantiate(element);
        parentDom.appendChild(newInstance.dom);
        return newInstance;
    }
    else if (element === undefined) {
        // 当props.children较短时，element出现undefined实际上就是需要删除
        parentDom.removeChild(instance.dom);
        return null;
    }
    else if (instance.element.type === element.type) {
        // 说明相同类型的type，可复用dom，继而修改原 dom 上的属性
        updateDomProperties(instance.dom, instance.element.props, element.props);
        instance.childInstances = reconcileChildren(instance, element);
        // dom 已更新至最新，Fishtail element保持同步
        instance.element = element;
        return instance;
    }
    else {
        // 两边不同，都存在，做替换
        var newInstance = instantiate(element);
        parentDom.replaceChild(newInstance.dom, instance.dom);
        return newInstance;
    }
};
// 将一个 fishtail 元素实例化成 fishtail instance 结构
var instantiate = function (element) {
    var type = element.type, props = element.props;
    var isTextELement = type === TEXT_ELEMENT_TYPE;
    var dom = isTextELement ? document.createTextNode('') : document.createElement(type);
    // 抽离属性添加，加入对比层，供复用 dom 的场景下复用方法
    updateDomProperties(dom, {}, props);
    var childELements = props.children || [];
    // 这里通过递归不断拿到下面每一层的 instance 结构，再通过后面的 append 操作生成出完整的 DOM 树
    var childInstances = childELements.map(instantiate);
    childInstances.forEach(function (childrenInstance) {
        dom.appendChild(childrenInstance.dom);
    });
    return { element: element, dom: dom, childInstances: childInstances };
};
// 对比更新dom的属性和事件，核心是最终 dom 的属性要和 nextProps保持一致，但不要重复删除添加
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
var reconcileChildren = function (instance, element) {
    var dom = instance.dom, childInstances = instance.childInstances;
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

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

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
    __spreadArrays(childrenList).forEach(function (children) {
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
 * @return { IFishtailElement } 最终也是返回一个 fishtaile 元素，不过是文案类型的
 */
var createTextElement = function (nodeValue) {
    return createElement(TEXT_ELEMENT_TYPE, { nodeValue: nodeValue });
};

var Fishtail = {
    render: render,
    createElement: createElement
};
window.Fishtail = Fishtail;
//# sourceMappingURL=bundle.cjs.js.map
