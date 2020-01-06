"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var SpecialChars_1 = require("./contants/SpecialChars");
/**
 * @description
 * 相当于 React.createELement 方法
 * 1. 该方法的目的是把 JSX 被编译的东西，利用该方法转换成一个 fishtail 元素
 * 2. 转换出的 fishtail 元素将可以在 render 中调用继而渲染到页面
 * @param { string } type 元素类型
 * @param { IFishtailElementProps } config 元素的属性集合
 * @param { Array<IFishtailElement|string> } childrenList 子元素的列表
 * @return { IFishtailElement } 一个 fishtail 元素
*/
exports.createELement = function (type, config) {
    var childrenList = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        childrenList[_i - 2] = arguments[_i];
    }
    var props = __assign({}, config);
    var rawChlidren = [];
    __spreadArrays(childrenList).forEach(function (children) {
        if (children !== null && children !== false && children !== undefined) {
            if (!(children instanceof Object)) {
                children = createTextElement(children);
            }
            rawChlidren.push(children);
        }
    });
    props.children = rawChlidren;
    return { type: type, props: props };
};
/**
 * @description
 * 当处理 JSX 时，遇到 text 文案类型时，需要特殊创建
 * @param { string | number } nodeValue 文案内容
 * @return { IFishtailElement } 最终也是返回一个 fishtaile 元素，不过是文案类型的
 */
var createTextElement = function (nodeValue) {
    return exports.createELement(SpecialChars_1.TEXT_ELEMENT_TYPE, { nodeValue: nodeValue });
};
