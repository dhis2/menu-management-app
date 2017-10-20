import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SinglePanelLayout from 'd2-ui/lib/layout/SinglePanel.component';
import Heading from 'd2-ui/lib/headings/Heading.component';
import HeaderBar from '../header/HeaderBar';
import Translate from '../utils/Translate';
import MenuManagement from '../menu-management/MenuManagement';
import SnackBar from '../snack-bar/SnackBar';

export default class App extends Component {
    getChildContext() {
        return {
            d2: this.props.d2,
        };
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
                            <Heading style={{ width: '100%', paddingLeft: '1rem' }}>
                                <Translate>Your_apps</Translate>
                            </Heading>
                            <div style={helpTextStyle}>
                                <Translate>Drag_and_drop</Translate>
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
    d2: PropTypes.object.isRequired,
};

App.childContextTypes = {
    d2: PropTypes.object,
};
