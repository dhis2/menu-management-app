import { snackBarStore$ } from './store';

export function closeSnackBar() {
    snackBarStore$
        .setState(Object.assign(
            {},
            snackBarStore$.getState(),
            { open: false }
        ));
}

export function setSnackMessage(message, action = 'ok', customAction) {
    snackBarStore$
        .setState({
            message,
            action,
            open: true,
            onActionTouchTap: customAction,
        });
}
