import { h, render, Component } from 'preact';
import miniToastr from 'mini-toastr';
import { pins } from './lib/pins';
import { Menu } from './components/menu';
import { Page } from './components/page';
import { loadConfig, loadRules } from './lib/config';
import { settings } from './lib/settings';
import { loader } from './lib/loader';
import { loadPlugins, firePageLoad } from './lib/plugins';
import { menu } from './lib/menu';

miniToastr.init({})

const clearSlashes = path => {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
};

const getFragment = () => {
    const match = window.location.href.match(/#(.*)$/);
    const fragment = match ? match[1] : '';
    return clearSlashes(fragment);
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            menuActive: false,
            menu: menu.menus[0],
            page:  menu.menus[0],
            changed: false,
        }

        this.menuToggle = () => {
            this.setState({ menuActive: !this.state.menuActive });
        }
    }

    getBreadcrumbs(page) {
        if (!page) return (null);

        return (<li><a href={`#${page.href}`}>{page.pagetitle == null ? page.title : page.pagetitle}</a></li>)
    }

    render(props, state) {
        
        const params = getFragment().split('/').slice(2);
        const active = this.state.menuActive ? 'active' : '';
        return (
            <div id="layout1" class={active}>
                <nav class="navbar is-info" role="navigation" aria-label="main navigation">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="https://bulma.io">
                            <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28" />
                        </a>
                        <div class="navbar-burger burger" data-target="navbarExampleTransparentExample">
                        <span></span>
                        <span></span>
                        <span></span>
                        </div>
                    </div>
                    <div id="navbarBasicExample" class="navbar-menu">
                        <div class="navbar-start">
                            <nav class="breadcrumb has-succeeds-separator" aria-label="breadcrumbs">
                                <ul>
                                    {this.getBreadcrumbs(state.page.parent)}
                                    {this.getBreadcrumbs(state.page)}
                                </ul>
                            </nav>
                        </div>
                        <div class="navbar-end">
                        { state.changed ? (
                            <a style="float: right" href="#tools/diff">CHANGED! Click here to SAVE</a>
                        ) : (null) }
                        </div>
                    </div>
                </nav>
                

                <Menu menus={menu.menus} selected={state.menu} />
                <Page page={state.page} params={params} changed={this.state.changed} />
                

            </div>
        );
    }

    componentDidUpdate() {
        this.onPageLoad();
    }

    componentDidMount() {
        loader.hide();

        let current = '';
        const fn = () => {
            const newFragment = getFragment();
            const diff = settings.diff();
            if(this.state.changed !== !!diff.length) {
                this.setState({changed: !this.state.changed})
            }
            if(current !== newFragment) {
                current = newFragment;
                const parts = current.split('/');
                const m = menu.menus.find(menu => menu.href === parts[0]);
                const page = parts.length > 1 ? menu.routes.find(route => route.href === `${parts[0]}/${parts[1]}`) : m;
                if (page) {
                    this.setState({ page, menu: m, menuActive: false });
                }
            }
        }
        this.interval = setInterval(fn, 100);

        this.onPageLoad();
    }

    onPageLoad() {
        window.requestAnimationFrame(() => {
            firePageLoad(); 
        });
    }

    componentWillUnmount() {}
}

const load = async () => {
    await loadConfig();
    await loadRules();
    await loadPlugins();
    render(<App />, document.body);
}

load();

console.log(document.location);