// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ToDoListItem from './cards/ToDoItemsList';
import ToDoItemDetails from './cards/ToDoItemDetails';

function App() {
    return (
        <Router>
            <Switch>
                <Route exact path="/" component={ToDoListItem} />
                <Route path="/details/:id" component={ToDoItemDetails} />
            </Switch>
        </Router>
    );
}

export default App;
