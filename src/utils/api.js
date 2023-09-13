import React from 'react';

const API_BASE_URL = 'https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler';

export const getToDoItems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/todo-items`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch to-do items');
        }

        const data = await response.json();
        return data.map((item) => ({
            ...item,
            description: item.assignment.description, // Access the description from the assignment
        }));
    } catch (error) {
        throw error;
    }
};