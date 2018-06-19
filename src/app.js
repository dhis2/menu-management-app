import React from 'react';
import { render } from 'react-dom';
import log from 'loglevel';
import { init, config, getManifest, getUserSettings } from 'd2/lib/d2';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// The react-tap-event-plugin is required by material-ui to make touch screens work properly with onClick events
import injectTapEventPlugin from 'react-tap-event-plugin';

import App from './app/App';
import './app/app.css';

const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line
injectTapEventPlugin();

render(
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <LoadingMask />
    </MuiThemeProvider>,
    document.getElementById('app'),
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


getManifest('./manifest.webapp')
    .then((manifest) => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        config.baseUrl = `${baseUrl}/api`;

        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);

        return getUserSettings()
            // Load translations for the users locale with english as the fallback language
            .then(({ keyUiLocale }) => {
                // Get userlocale and load the tanslations
                if (keyUiLocale && keyUiLocale !== 'en') {
                    config.i18n.sources.add(`./i18n/menu-management-${keyUiLocale}.properties`);
                }
                config.i18n.sources.add('./i18n/menu-management.properties');
            })
            // Fallback to english
            .catch(() => {
                config.i18n.sources.add('./i18n/menu-management.properties');
            });
    })
    .then(init)
    .then(startApp)
    .catch(log.error.bind(log));
