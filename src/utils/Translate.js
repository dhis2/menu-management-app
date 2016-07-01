import React, { PropTypes } from 'react';

export default function Translate(props, context) {
    return <span>{context.d2.i18n.getTranslation(props.children)}</span>;
}
Translate.contextTypes = {
    d2: PropTypes.object,
}