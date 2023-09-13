import React from 'react';
import { Typography } from '@ellucian/react-design-system/core';

const AssignmentDetails = ({ assignment }) => {
    return (
        <div>
            <Typography>
                <h1>Assignment Details</h1>
                <h2>{assignment.context_name}</h2>
                <p>{assignment.description}</p>
            </Typography>
        </div>
    );
};

export default AssignmentDetails;
