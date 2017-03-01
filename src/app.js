// When the app is built for development, DHIS_CONFIG is replaced with the config read from $DHIS2_HOME/config.js[on]
// When the app is built for production, process.env.NODE_ENV is replaced with the string 'production', and
// DHIS_CONFIG is replaced with an empty object
const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line

import React from 'react';
import { render } from 'react-dom';
import log from 'loglevel';
import { init, config, getManifest, getUserSettings } from 'd2/lib/d2';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// The react-tap-event-plugin is required by material-ui to make touch screens work properly with onClick events
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import App from './app/App';
import './app/app.scss';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Render the a LoadingMask to show the user the app is in loading
// The consecutive render after we did our setup will replace this loading mask
// with the rendered version of the application.
render(
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LoadingMask />
    </MuiThemeProvider>,
    document.getElementById('app')
);

/**
 * Renders the application into the page.
 *
 * @param d2 Instance of the d2 library that is returned by the `init` function.
 */
function startApp(d2) {
    render(
        <MuiThemeProvider muiTheme={getMuiTheme()}>
            <App d2={d2} />
        </MuiThemeProvider>,
        document.querySelector('#app'));
}


Promise.all([getManifest('./manifest.webapp'), getUserSettings()])
    .then(([manifest, { keyUiLocale }]) => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        config.baseUrl = `${baseUrl}/api`;

        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);

        // Get userlocale and load the tanslations
        if (keyUiLocale && keyUiLocale !== 'en') {
            config.i18n.sources.add(`./i18n/menu-management-${keyUiLocale}.properties`);
        }
        config.i18n.sources.add('./i18n/menu-management.properties');
    })
    .then(init)
    .then(startApp)
    .catch(log.error.bind(log));
