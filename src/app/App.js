import React, { Component, PropTypes } from 'react';
import log from 'loglevel';

import HeaderBar from '../header/HeaderBar';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';
import SinglePanelLayout from 'd2-ui/lib/layouts/SinglePanel.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import Translate from '../utils/Translate';
import MenuManagement from '../menu-management/MenuManagement';

export default class App extends Component {
    getChildContext() {
        return {
            d2: this.props.d2,
        };
    }

    _sidebarItemClicked(sideBarItemKey) {
        log.info('Clicked on ', sideBarItemKey);
    }

    render() {
        const sideBarSections = [
            { key: 'item1', label: 'Item 1' },
            { key: 'item2', label: 'Item 2' },
        ];

        return (
            <div className="app-wrapper">
                <HeaderBar />
                <SinglePanelLayout>
                    <div style={{ width: '100%' }}>
                        <Heading><Translate>app_management</Translate></Heading>
                        <MenuManagement />
                    </div>
                </SinglePanelLayout>
            </div>
        );
    }
}

App.propTypes = {
    name: React.PropTypes.string,
    d2: React.PropTypes.object,
};

App.childContextTypes = {
    d2: React.PropTypes.object,
};

App.defaultProps = {
    name: 'John',
};
