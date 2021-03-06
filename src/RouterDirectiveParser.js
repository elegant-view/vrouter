/**
 * @file 路由组件解析器
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import DirectiveParser from 'vtpl/parsers/DirectiveParser';
import parserStage from 'vtpl/parsers/parserStage';
import DoneChecker from 'vtpl/DoneChecker';
import * as utils from './utils';
import * as state from 'state/State';
import {getType} from 'vcomponent/Component';
import EventTarget from './EventTarget';

const FIND_COMPONENT = Symbol('findComponent');
const RENDER_ROUTE = Symbol('renderRoute');
const DESTROY_ROUTE_TREE = Symbol('destroyRouteTree');

export default class RouterDirectiveParser extends DirectiveParser {

    /**
     * @override
     */
    static priority = 3;

    constructor(...args) {
        super(...args);

        /**
         * 当前实例对应的路径段
         *
         * @type {string}
         */
        this.routePath = null;

        /**
         * 当前地址栏中的hash地址位于this.routePath之前的部分
         *
         * @type {Array.<string>}
         */
        this.routePathPrefix = null;

        this.Component = null;
    }

    [FIND_COMPONENT]() {
        const routeManager = this.tree.getTreeVar('routeManager');

        let result;
        do {
            result = routeManager.next();
        } while (result && !result.Component);

        return result || {};
    }

    [RENDER_ROUTE](Component, done) {
        this[DESTROY_ROUTE_TREE]();

        if (Component) {
            const routeManager = this.tree.getTreeVar('routeManager');
            const eventTarget = new EventTarget();
            routeManager.beforeEnter(eventTarget);
            if (eventTarget.isPreventDefault()) {
                return done && done();
            }

            const nodesManager = this.tree.getTreeVar('nodesManager');
            const routeNode = nodesManager.createElement(`ev-${utils.camel2line(getType(Component))}`);
            routeNode.setAttribute('query', '{__query__}');
            this.routeTree = this.createTree(this.tree, routeNode, routeNode);

            const componentManager = this.tree.getTreeVar('componentManager');
            componentManager.register([Component]);

            this.routeTree.compile();
            this.routeTree.link();
            this.routeTree.initRender(() => {
                routeManager.afterEnter();
                done && done();
            });

            this.startNode.getParentNode().insertBefore(routeNode, this.startNode);
        }
        else {
            done && done();
        }
    }

    collectExprs() {}

    linkScope() {
        const eventBus = this.tree.getTreeVar('eventBus');
        eventBus.on('routechange', this.onRouteChange, this);
    }

    initRender(done) {
        const doneChecker = new DoneChecker(done);

        const {Component, path, prefix, query, queryString} = this[FIND_COMPONENT]();
        this.routePath = path;
        this.routePathPrefix = prefix;
        this.Component = Component;
        this.query = query;
        this.queryString = queryString;

        doneChecker.add(innerDone => this[RENDER_ROUTE](Component, innerDone));

        doneChecker.complete();
    }

    /**
     * hash路径发生了变化的回调方法，仅在非destroied状态下执行
     *
     * @private
     */
    onRouteChange() {
        if (!this.isInStage(parserStage.READY)) {
            return;
        }

        const {Component, path, prefix, queryString, query, fullUrl} = this[FIND_COMPONENT]();
        if (Component !== this.Component
            || path !== this.routePath
            || prefix.join('/') !== this.routePathPrefix.join('/')
            || (fullUrl.join('/') === `${prefix.join('/')}/${path}/` && queryString !== this.queryString)
        ) {
            this.routePath = path;
            this.routePathPrefix = prefix;
            this.Component = Component;
            this.query = query;
            this.queryString = queryString;
            this[RENDER_ROUTE](Component);
        }
    }

    hide(done) {
        if (this.routeTree) {
            this.routeTree.goDark(done);
        }
        else {
            done && done();
        }
    }

    show(done) {
        if (this.routeTree) {
            this.routeTree.restoreFromDark(done);
        }
        else {
            done && done();
        }
    }

    [DESTROY_ROUTE_TREE]() {
        if (this.routeTree) {
            this.removeTree(this.routeTree);
            this.routeTree = null;
        }
    }

    release() {
        this[DESTROY_ROUTE_TREE]();

        const eventBus = this.tree.getTreeVar('eventBus');
        eventBus.off('routechange', this.onRouteChange, this);

        super.release();
    }

    static isProperNode(node) {
        return super.isProperNode(node) && /^\s*route\s*$/.test(node.getNodeValue());
    }
}
