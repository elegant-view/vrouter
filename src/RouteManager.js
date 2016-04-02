/**
 * @file 路径管理器
 *       {
 *       	'project': {
 *       		Component: [...],
 *       		children: {
 *       			'list': {
 *       				Component: [...]
 *       			},
 *       			'detail': {
 *       				Component: [...]
 *       			}
 *       		}
 *       	},
 *       	'user': {
 *       		Component: [...],
 *       		isDefault: true,
 *       		children: {
 *       			'list': {
 *       				Component: [...]
 *       			},
 *       			'detail': {
 *       				Component: [...]
 *       			}
 *       		}
 *       	}
 *       }
 * @author yibuyisheng(yibuyisheng@163.com)
 */

const ROUTE_CONFIG = Symbol('routeConfig');
const FULL_URL = Symbol('fullUrl');
const PARSE_CURSOR = Symbol('parseCursor');
const STATE = Symbol('state');
const CUR_ROUTE = Symbol('curRoute');

const STATE_READY = Symbol('stateReady');
const STATE_ITERATING = Symbol('stateIterating');

export default class RouteManager {
    registerRoute(routeConfig) {
        if (this[STATE]) {
            throw new Error('illegal state');
        }

        this[ROUTE_CONFIG] = routeConfig;
        this[STATE] = STATE_READY;
    }

    start(url) {
        if (this[STATE] !== STATE_READY) {
            throw new Error('illegal state');
        }

        this[FULL_URL] = url.replace(/^(#\/|\/|#)|\/$/g, '').split('/');
        this[PARSE_CURSOR] = 0;
        this[CUR_ROUTE] = this[ROUTE_CONFIG];

        this[STATE] = STATE_ITERATING;
    }

    next() {
        if (this[STATE] !== STATE_ITERATING) {
            throw new Error('illegal state');
        }

        if (!this[CUR_ROUTE]) {
            return null;
        }

        let partialUrl = this[FULL_URL][this[PARSE_CURSOR]];
        if (!partialUrl) {
            return null;
        }

        ++this[PARSE_CURSOR];

        let defaultRoute;
        let curRoute;
        for (let route in this[CUR_ROUTE]) {
            if (partialUrl === route) {
                curRoute = this[CUR_ROUTE][partialUrl];
                break;
            }
            else if (this[CUR_ROUTE][route] && this[CUR_ROUTE][route].isDefault) {
                defaultRoute = this[CUR_ROUTE][route];
            }
        }
        if (!curRoute) {
            curRoute = defaultRoute;
        }
        this[CUR_ROUTE] = curRoute ? curRoute.children : null;

        return curRoute.Component;
    }

    end() {
        if (this[STATE] !== STATE_ITERATING) {
            throw new Error('illegal state');
        }

        this[STATE] = STATE_READY;
        this[FULL_URL] = null;
        this[PARSE_CURSOR] = null;
        this[CUR_ROUTE] = null;
    }

    destroy() {

    }
}
