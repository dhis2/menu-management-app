import { snackBarStore$ } from './store';

export function closeSnackBar() {
    snackBarStore$
        .setState({
            ...snackBarStore$.getState(),
            open: false,
        });
}

export function setSnackMessage(message, action = 'ok', customAction) {
    snackBarStore$
        .setState({
            message: message,
            action: action,
            open: true,
            onActionTouchTap: customAction,
        });
}
