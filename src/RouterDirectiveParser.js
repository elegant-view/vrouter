/**
 * @file 路由组件解析器
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import DirectiveParser from 'vtpl/parsers/DirectiveParser';
import parserState from 'vtpl/parsers/parserState';

const FIND_COMPONENT = Symbol('findComponent');
const RENDER_ROUTE = Symbol('renderRoute');
const ON_ROUTE_CHANGE = Symbol('onRouteChange');
const DESTROY_ROUTE_TREE = Symbol('destroyRouteTree');

export default class RouterDirectiveParser extends DirectiveParser {
    [FIND_COMPONENT]() {
        let routeManager = this.tree.getTreeVar('routeManager');
        return routeManager.next();
    }

    [RENDER_ROUTE](Component) {
        this[DESTROY_ROUTE_TREE]();

        let nodesManager = this.tree.getTreeVar('nodesManager');
        let routeNode = nodesManager.createElement('ui-' + Component.name);
        this.routeTree = this.createTree(this.tree, routeNode, routeNode);

        let componentManager = this.tree.getTreeVar('componentManager');
        componentManager.register([Component]);

        this.node.getParentNode().insertBefore(routeNode, this.node);

        this.routeTree.compile();
        this.routeTree.link();
        this.routeTree.initRender();
    }

    collectExprs() {}

    linkScope() {
        let eventBus = this.tree.getTreeVar('eventBus');
        eventBus.on('routechange', this[ON_ROUTE_CHANGE], this);
    }

    [ON_ROUTE_CHANGE]() {
        if (this.$state !== parserState.READY) {
            return;
        }

        let Component = this[FIND_COMPONENT]();
        if (!Component) {
            return;
        }

        this[RENDER_ROUTE](Component);
    }

    goDark() {
        if (this.isGoDark) {
            return;
        }

        this.routeTree.goDark();
    }

    restoreFromDark() {
        if (!this.isGoDark) {
            return;
        }

        this.routeTree.restoreFromDark();
    }

    [DESTROY_ROUTE_TREE]() {
        if (this.routeTree) {
            this.removeTree(this.routeTree);
            this.routeTree = null;
        }
    }

    destroy() {
        this[DESTROY_ROUTE_TREE]();

        let eventBus = this.tree.getTreeVar('eventBus');
        eventBus.off('routechange', this[ON_ROUTE_CHANGE], this);

        super.destroy();
    }

    static isProperNode(node) {
        return super.isProperNode(node) && /^\s*route\s*$/.test(node.getNodeValue());
    }
}
