/**
 * @file 地址监听器对象
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import Event from 'event/Event';
import * as utils from './utils';

const history = [location.hash];
let state = 'ready';

if (window.addEventListener) {
    window.addEventListener('hashchange', onHashChange, false);
}
else if ('onhashchange' in window && document.documentMode > 7) {
    window.attachEvent('onhashchange', onHashChange);
}
else {
    this.rollTimer = setInterval(onHashChange, 100);
}

export const locator = utils.extend(new Event(), {
    start() {
        state = 'listening';
    },
    end() {
        state = 'ready';
    }
});

function onHashChange() {
    if (state !== 'listening') {
        return;
    }

    let curhash = location.hash;
    if (!history.length || curhash !== history[history.length - 1]) {
        locator.trigger('change', {oldUrl: history[history.length - 1], newUrl: curhash});

        history.push(curhash);
    }
}
