import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CanvasCardWrapper from './src/cards/ToDoItemsList';
import AssignmentDetails from './src/page/AssignmentDetails';

function App() {
    window.toggleExperienceToolkitDevLibs(true);
    return (
        <Router>
            <Switch>
                <Route exact path="/" component={CanvasCardWrapper} />
                <Route path="/assignment-details/:id" component={AssignmentDetails} />
            </Switch>
        </Router>
    );
}

export default App;
