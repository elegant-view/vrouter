import 'test/spec/RouteManagerSpec';
import VRouter from 'main';
import Component from 'vcomponent/Component';

class Project extends Component {
    getTemplate() {
        return 'project';
    }
}

describe('whole', () => {
    let rootNode = document.createElement('div');

    beforeEach(() => {
        rootNode.innerHTML = '<!-- route -->';
    });

    it('base', done => {
        let vrouter = new VRouter({
            startNode: rootNode,
            endNode: rootNode
        });

        vrouter.registerRoute({
            project: {
                Component: Project
            }
        });
        vrouter.render();
        location.hash = '#/project';

        setTimeout(() => {
            expect(rootNode.textContent).toBe('project');
            done();
        }, 72);
    });
});
