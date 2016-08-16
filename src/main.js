/**
 * @file 主文件
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import VComponent from 'vcomponent';
import {locator} from './locator';
import RouteManager from './RouteManager';
import Event from 'event/Event';
import RouterDirectiveParser from './RouterDirectiveParser';

const ROUTE_MANAGER = Symbol('routeManager');
const EVENT_BUS = Symbol('eventBus');

locator.start();

export default class VRouter extends VComponent {
    constructor(options) {
        super(options);

        this.vtpl.registerParser(RouterDirectiveParser);

        this[ROUTE_MANAGER] = new RouteManager();
        this[EVENT_BUS] = new Event();

        this.vtpl.tree.setTreeVar('routeManager', this[ROUTE_MANAGER]);
        this.vtpl.tree.setTreeVar('eventBus', this[EVENT_BUS]);

        locator.on('change', this.onChange, this);
    }

    onChange(params) {
        this[ROUTE_MANAGER].start(location.hash);
        this[EVENT_BUS].trigger('routechange');
        this[ROUTE_MANAGER].end();
    }

    render() {
        this[ROUTE_MANAGER].start(location.hash);
        super.render();
        this[ROUTE_MANAGER].end();
    }

    registerRoute(routeConfig) {
        this[ROUTE_MANAGER].registerRoute(routeConfig);
    }

    destroy() {
        super.destroy();
        this[ROUTE_MANAGER].destroy();
        this[ROUTE_MANAGER] = null;
        locator.off('change', this.onChange, this);

        this[EVENT_BUS] = null;
    }
}
