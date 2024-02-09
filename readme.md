# Ellucian Experience Card - Canvas To-Do Overview
## Introduction
This project introduces a custom card for the Ellucian Experience platform, aimed at streamlining the student experience by providing a focused and intuitive overview of their pending to-do items from Canvas. By leveraging the React SDK for seamless integration and utilizing AWS Lambda as middleware for data fetching, this extension offers students a personalized dashboard to track their assignments and tasks directly within the Ellucian Experience, enhancing their academic engagement and productivity.

## Features
To-Do Overview: Displays a concise list of the user's pending to-do items from Canvas, including assignments, quizzes, and upcoming tasks.
Direct Canvas Access: Features a button at the bottom of the card that routes the logged-in user directly to Canvas, enabling them to address and manage their to-do items efficiently.
Responsive Design: Ensures a seamless and accessible user experience across various devices, catering to the dynamic needs of modern students.

## How It Works
The Ellucian Experience Card for Canvas To-Do Items simplifies how students interact with their academic tasks. Here's an outline of the data flow and functionality:

Authentication: Utilizes the institution's credentials to authenticate users on the Ellucian Experience platform.
AWS Lambda Middleware: Employs custom AWS Lambda functions to securely fetch the user's to-do list from Canvas.
Data Retrieval and Presentation: The middleware retrieves the to-do items from Canvas and presents them in an organized manner, providing students with a clear view of their pending tasks.
Direct Canvas Routing: A dedicated button at the bottom of the card allows users to navigate directly to Canvas, facilitating immediate action on their to-do items.

## Architectural Overview
Canvas LMS Integration: Leverages the Canvas LMS API to fetch to-do list information, ensuring that students have access to real-time data regarding their academic tasks.
AWS Lambda: Utilizes serverless functions hosted on AWS Lambda to manage API requests to Canvas, offering a scalable and secure solution for data retrieval without burdening the client-side application.
