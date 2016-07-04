import React, { Component, PropTypes } from 'react';
import log from 'loglevel';

import HeaderBar from '../header/HeaderBar';
import SinglePanelLayout from 'd2-ui/lib/layouts/SinglePanel.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import Translate from '../utils/Translate';
import MenuManagement from '../menu-management/MenuManagement';
import SnackBar from '../snack-bar/SnackBar';

import Paper from 'material-ui/lib/paper';

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
        const extraPaperStyle = {
            flex: 1,
            padding: '2rem',
            margin: '1rem',
            height: '6rem',
        };

        // TODO: The only change here is the marginTop. D2-UI should support merging of the style object for
        // both singlepanel and twopanel layouts
        const layoutStyle = {
            flex: 1,
            display: 'flex',
            flexOrientation: 'row',
            marginTop: '4rem',
            marginLeft: '2rem',
            marginRight: '2rem',
        };

        return (
            <div className="app-wrapper">
                <HeaderBar />
                <SinglePanelLayout style={layoutStyle}>
                    <div style={{ width: '100%' }}>
                        <Heading><Translate>Your apps</Translate></Heading>
                        <div style={{ display: 'flex' }}>
                            <MenuManagement />
                            <Paper style={extraPaperStyle}>
                                <Translate>Drag and drop the menu items to re-order them! 😊</Translate>
                            </Paper>
                        </div>
                        <SnackBar />
                    </div>
                </SinglePanelLayout>
            </div>
        );
    }
}

App.propTypes = {
    name: PropTypes.string,
    d2: PropTypes.object,
};

App.childContextTypes = {
    d2: PropTypes.object,
};

App.defaultProps = {
    name: 'John',
};
