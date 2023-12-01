// import React from 'react';
// // import DOMPurify from 'dompurify'; // Removed DOMPurify import
// import { useLocation } from 'react-router-dom';

// const AssignmentDetails = () => {
//     const location = useLocation(); // Using useLocation hook
//     console.log(location.state);
//     const { assignmentDetails } = location.state || {};

//     if (!assignmentDetails) {
//         return <div>Loading or no assignment details found...</div>;
//     }

//     // Directly using assignmentDetails.description without sanitization
//     // const safeDescription = DOMPurify.sanitize(assignmentDetails.description);

//     return (
//         <div>
//             <h1>test</h1>
//             <h1>{assignmentDetails.name || 'Assignment Details'}</h1>
//             {/* Using the original description */}
//             <div dangerouslySetInnerHTML={{ __html: assignmentDetails.description }} />
//         </div>
//     );
// };

// export default AssignmentDetails;

import React from 'react';
// import DOMPurify from 'dompurify'; // Removed DOMPurify import
// import { useLocation } from 'react-router-dom';

const AssignmentDetails = () => {
    return (
        <div>
            <h1>Static Test</h1>
        </div>
    );
};

export default AssignmentDetails;