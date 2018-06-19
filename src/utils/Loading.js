import React from 'react';
import CircularProgress from 'material-ui/CircularProgress/CircularProgress';
import Translate from '../utils/Translate';

export default function Loading() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress size={0.5} />
            <Translate>Loading</Translate>
        </div>
    );
}
