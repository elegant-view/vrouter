import RouteManager from 'RouteManager';

describe('route manager', () => {
    it('base', () => {
        let manager = new RouteManager();
        manager.registerRoute({
            'project': {
            	Component: '1',
            	children: {
            		'list': {
            			Component: '1.1'
            		},
            		'detail': {
            			Component: '1.2'
            		}
            	}
            },
            'user': {
            	Component: '2',
            	children: {
            		'list': {
            			Component: '2.1'
            		},
            		'detail': {
            			Component: '2.2'
            		}
            	}
            }
        });

        manager.start('/project/list');
        expect(manager.next()).toBe('1');
        expect(manager.next()).toBe('1.1');
        expect(manager.next()).toBe(null);
        manager.end();

        manager.start('/project/detail');
        expect(manager.next()).toBe('1');
        expect(manager.next()).toBe('1.2');
        expect(manager.next()).toBe(null);
        manager.end();

        manager.start('/user/list');
        expect(manager.next()).toBe('2');
        expect(manager.next()).toBe('2.1');
        expect(manager.next()).toBe(null);
        manager.end();

        manager.start('/user/detail');
        expect(manager.next()).toBe('2');
        expect(manager.next()).toBe('2.2');
        expect(manager.next()).toBe(null);
        manager.end();
    });
});
