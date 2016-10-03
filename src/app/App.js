import React, { Component, PropTypes } from 'react';
import log from 'loglevel';

import HeaderBar from '../header/HeaderBar';
import SinglePanelLayout from 'd2-ui/lib/layout/SinglePanel.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import Translate from '../utils/Translate';
import MenuManagement from '../menu-management/MenuManagement';
import SnackBar from '../snack-bar/SnackBar';

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
        const helpTextStyle = {
            flex: 1,
            padding: '.5rem 1rem',
            color: '#666',
        };

        // TODO: The only change here is the marginTop. D2-UI should support merging of the style object for
        // both singlepanel and twopanel layouts
        const layoutStyle = {
            flex: 1,
            display: 'flex',
            flexOrientation: 'column',
            marginTop: '4rem',
            marginLeft: '2rem',
            marginRight: '2rem',
        };

        const contentStyle = {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        };

        const innerContentStyle = {
            display: 'flex',
            flexDirection: 'column',
        };

        return (
                <div className="app-wrapper">
                    <HeaderBar />
                    <SinglePanelLayout style={layoutStyle}>
                        <div style={contentStyle}>
                            <div style={innerContentStyle}>
                                <Heading style={{ width: '100%', paddingLeft: '1rem' }}><Translate>Your apps</Translate></Heading>
                                <div style={helpTextStyle}>
                                    <Translate>Drag and drop the menu items to re-order them! 😊</Translate>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <MenuManagement />
                                </div>
                            </div>
                        </div>
                    </SinglePanelLayout>
                    <SnackBar />
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
