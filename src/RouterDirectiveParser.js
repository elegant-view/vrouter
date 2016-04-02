/**
 * @file 路由组件解析器
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import DirectiveParser from 'vtpl/parsers/DirectiveParser';

export default class RouterDirectiveParser extends DirectiveParser {
    findComponent() {
        let routeManager = this.tree.getTreeVar('routeManager');
        return routeManager.next();
    }

    renderRoute(Component) {
        if (this.routeTree) {
            this.routeTree.destroy();
        }

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
        eventBus.on('routechange', this.onRouteChange, this);
    }

    onRouteChange() {
        let Component = this.findComponent();
        if (!Component) {
            return;
        }

        this.renderRoute(Component);
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

    destroy() {
        let eventBus = this.tree.getTreeVar('eventBus');
        eventBus.off('routechange', this.onRouteChange, this);

        super.destroy();
        this.routeTree && this.routeTree.destroy();
        this.routeTree = null;
    }

    static isProperNode(node) {
        return super.isProperNode(node) && /^\s*route\s*$/.test(node.getNodeValue());
    }
}
