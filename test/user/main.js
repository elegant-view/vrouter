import VRouter from 'main';
import Users from 'test/user/pages/Users';
import Projects from 'test/user/pages/Projects';


let vrouter = new VRouter({
    startNode: document.body,
    endNode: document.body
});
vrouter.registerRoute({
    users: {
        isDefault: true,
        Component: Users,
        children: {}
    },
    projects: {
        Component: Projects
    }
});
vrouter.render();
