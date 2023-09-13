import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ToDoCard from '../cards/ToDoItemsList';
import AssignmentDetails from '../page/AssignmentDetails';

const AppRouter = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/" component={ToDoCard} />
                <Route path="/details/:id" component={AssignmentDetails} />
            </Switch>
        </Router>
    );
};

export default AppRouter;

