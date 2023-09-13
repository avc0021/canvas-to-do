// import React, { useEffect, useState } from 'react';
// import { Table, TableBody, TableCell, TableRow } from '@ellucian/react-design-system/core';
// import { useParams } from 'react-router-dom'; // Import useParams to get the item ID
// import PropTypes from 'prop-types';

// const ToDoItemDetails = () => {
//     const { id } = useParams(); // Get the item ID from the route parameter
//     const [itemDetails, setItemDetails] = useState(null);

//     useEffect(() => {
//         // Fetch item details based on the ID
//         fetch(`https://182ddzp131.execute-api.us-east-2.amazonaws.com/default/canvas-to-do/${id}`, {
//             method: 'GET'
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => setItemDetails(data))
//         .catch(error => console.error('Error fetching data:', error));
//     }, [id]); // Include id in the dependency array to re-fetch when the ID changes

//     if (!itemDetails) return <div>Loading...</div>;

//     return (
//         <Table>
//             <TableBody>
//                 <TableRow>
//                     <TableCell>Assignment Name</TableCell>
//                     <TableCell>{itemDetails.context_name}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                     <TableCell>Description</TableCell>
//                     <TableCell>{itemDetails.description}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                     <TableCell>Due Date</TableCell>
//                     <TableCell>{itemDetails.due_at}</TableCell>
//                 </TableRow>
//             </TableBody>
//         </Table>
//     );
// };

// ToDoItemDetails.propTypes = {
//     itemDetails: PropTypes.shape({
//         context_name: PropTypes.string.isRequired,
//         description: PropTypes.string.isRequired,
//         due_at: PropTypes.string.isRequired,
//     }).isRequired,
// };

// export default ToDoItemDetails;

// src/card/ToDoItemDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getToDoItemDetails } from '../utils/api';

const ToDoItemDetails = () => {
    const { id } = useParams();
    const [itemDetails, setItemDetails] = useState({});

    useEffect(() => {
        // Fetch the details of the selected to-do item
        getToDoItemDetails(id)
            .then((data) => setItemDetails(data))
            .catch((error) => console.error('Error fetching item details:', error));
    }, [id]);

    return (
        <div>
            <h1>Assignment Details</h1>
            <h2>{itemDetails.context_name}</h2>
            <p>Due Date: {itemDetails.assignment?.due_at}</p>
            <p>Description: {itemDetails.assignment?.description}</p>
        </div>
    );
};

export default ToDoItemDetails;

