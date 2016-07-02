import React, { Component } from 'react';
import log from 'loglevel';

/**
 * Creates a higher order component that will pass data received from the `stateSource$` to the `BaseComponent`.
 * When a `LoadingComponent` is passed the HoC will render this when no data has been received yet.
 * This is useful for when the async is async and no default props are available on the `BaseComponent`.
 *
 * @props {Observable} stateSource$ The Observable stream that serves as a source for `BaseComponent` props.
 * @props {ReactComponent} BaseComponent The React Component to render with the props from the source.
 * @props {ReactComponent?} LoadingComponent The React Component to render while waiting for data from the source.
 *
 * @returns {ReactComponent} A HoC that waits for data from `stateSource$` and renders `BaseComponent` with the received data.
 */
export default function withStateFrom(stateSource$, BaseComponent, LoadingComponent) {
    return class extends Component {
        constructor(props, context) {
            super(props, context);

            this.valueEmitted = false;
        }

        componentDidMount() {
            // Subscribe to the stateSource observable.
            this.disposable = stateSource$
                .subscribe(
                    (state) => {
                        this.valueEmitted = true;
                        this.setState(state)
                    },
                    (error) => log.error(error)
                );
        }

        componentWillUnmount() {
            this.disposable && this.disposable.dispose && this.disposable.dispose();
        }

        render() {
            // If a loading component is passed we will render that instead of the base component
            // when no values have been emitted yet. If no loading component is passed the
            // BaseComponent will be rendered instead and the possible loading status will have to
            // be taken care of there.
            if (LoadingComponent && !this.valueEmitted) {
                return (<LoadingComponent />);
            }

            return (
                <BaseComponent {...this.state} {...this.props} />
            );
        }
    };
}