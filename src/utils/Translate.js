import React from 'react';
import PropTypes from 'prop-types';

export default function Translate(props, context) {
    return <span>{context.d2.i18n.getTranslation(props.children)}</span>;
}

Translate.contextTypes = {
    d2: PropTypes.object,
};

Translate.propTypes = {
    children: PropTypes.string.isRequired,
};
