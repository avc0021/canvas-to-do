import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableRow, TextLink } from '@ellucian/react-design-system/core';
import { useHistory } from 'react-router-dom';

const ToDoItemsList = () => {
    const [toDoItems, setToDoItems] = useState([]);
    const history = useHistory();

    useEffect(() => {
        fetch('https://182ddzp131.execute-api.us-east-2.amazonaws.com/default/canvas-to-do', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => setToDoItems(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleItemClick = (item) => {
        // Use history.push() to navigate to the assignment details route
        history.push(`/details/${item.id}`);
    };

    return (
        <Table>
            <TableBody>
                {toDoItems.map(item => (
                    <TableRow key={item.id}>
                        <TableCell onClick={() => handleItemClick(item)}>
                            Assignment: <TextLink to={`/details/${item.id}`}>{item.context_name}</TextLink>
                        </TableCell>
                        <TableCell>
                            Due: {formatDate(item.assignment.due_at)}
                        </TableCell>
                        {/* <TableCell>
                            <p>Description: {item.assignment.description}</p>
                        </TableCell> */}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ToDoItemsList;
