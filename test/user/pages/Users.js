import Component from 'vcomponent/Component';

export default class Users extends Component {
    getTemplate() {
        return '<div>users</div><a href="#/projects">projects</a><!-- route -->';
    }
}
