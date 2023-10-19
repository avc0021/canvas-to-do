// import React, { useEffect, useState } from 'react';
// import { Table, TableBody, TableCell, TableRow, TextLink } from '@ellucian/react-design-system/core';
// // import { useHistory } from 'react-router-dom';

// const ToDoItemsList = () => {
//     const [toDoItems, setToDoItems] = useState([]);
//     // const history = useHistory();

//     useEffect(() => {
//         fetch('https://182ddzp131.execute-api.us-east-2.amazonaws.com/default/canvas-to-do', {
//             method: 'GET'
//         })
//             .then(response => response.json())
//             .then(data => setToDoItems(data))
//             .catch(error => console.error('Error fetching data:', error));
//     }, []);

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleString();
//     };

//     // const handleItemClick = (item) => {
//     //     // Use history.push() to navigate to the assignment details route
//     //     history.push(`/details/${item.id}`);
//     // };

//     return (
//         <Table>
//             <TableBody>
//                 {toDoItems.map(item => (
//                     <TableRow key={item.id}>
//                         {/* <TableCell onClick={() => handleItemClick(item)}> */}
//                         <TableCell>
//                             Assignment: <TextLink>{item.context_name}</TextLink>
//                         </TableCell>
//                         <TableCell>
//                             Due: {formatDate(item.assignment.due_at)}
//                         </TableCell>
//                         {/* <TableCell>
//                             <p>Description: {item.assignment.description}</p>
//                         </TableCell> */}
//                     </TableRow>
//                 ))}
//             </TableBody>
//         </Table>
//     );
// };

// export default ToDoItemsList;

import React, { useEffect, useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableRow, Button } from '@ellucian/react-design-system/core';
import { spacing40, spacing10 } from '@ellucian/react-design-system/core/styles/tokens';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import PropTypes from 'prop-types';
import { useIntl, IntlProvider } from 'react-intl';

// Styles for the courses
const columnStyles = {
    height: '100%',
    marginTop: 0,
    marginRight: spacing40,
    marginBottom: 0,
    marginLeft: spacing40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
};


// // Styles for the card
const styles = () => ({
    card: {
        marginRight: spacing40,
        marginLeft: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    }
});

const cacheKey = 'graphql-card:persons';

// CanvasCard component
const CanvasCard = (props) => {
    const {
        classes,
        cardControl: { setLoadingStatus, setErrorMessage },
        data: { getEthosQuery },
        cache: { getItem, storeItem }
    } = props;

    const intl = useIntl();
    const [persons, setPersons] = useState();
    const [canvasData, setCanvasData] = useState([]);


    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            const { data: cachedData, expired: cachedDataExpired = true } = await getItem({ key: cacheKey });

            if (cachedData) {
                setLoadingStatus(false);
                setPersons(() => cachedData);
            }

            if (cachedDataExpired || cachedData === undefined) {
                try {
                    const personsData = await getEthosQuery({ queryId: 'list-persons' });
                    const { data: { persons: { edges: personEdges } = [] } = {} } = personsData;
                    const persons = personEdges.map(edge => edge.node);
                    setPersons(() => persons);
                    storeItem({ key: cacheKey, data: persons });
                    setLoadingStatus(false);
                } catch (error) {
                    console.error('ethosQuery failed', error);
                    setErrorMessage({
                        headerMessage: intl.formatMessage({ id: 'PersonInformationCard-fetchFailed' }),
                        textMessage: intl.formatMessage({ id: 'PersonInformationCard-personsFetchFailed' }),
                        iconName: 'error',
                        iconColor: '#D42828'
                    });
                }
            }
        })();
    }, [getItem, getEthosQuery, intl, setErrorMessage, setLoadingStatus, storeItem]);

    async function sendBannerIdToLambda(bannerId) {
        if (!bannerId) {
            console.warn('Attempted to send an undefined bannerId to Lambda');
            return;
        }
        console.log(`Sending bannerId to Lambda: ${bannerId}`);

        // Add the bannerId as a query parameter to the endpoint URL
        const endpoint = `https://182ddzp131.execute-api.us-east-2.amazonaws.com/default/canvas-to-do?bannerId=${bannerId}`;

        try {
            const response = await fetch(endpoint, {
                method: 'GET'
            });

            if (!response.ok) {
                const responseBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseBody}`);
            }

            const responseData = await response.json();

            setCanvasData(prevData => {
                // Filter out todo items that already exist in the prevData based on the assignment id
                const newTodos = responseData.filter(todo => !prevData.some(pTodo => pTodo.assignment.id === todo.assignment.id));
                return [...prevData, ...newTodos];
            });
        } catch (error) {
            console.error('Error sending bannerId to Lambda:', error);
        }
    }

    useEffect(() => {
        if (persons && persons.length > 0) {
            persons.forEach(person => {
                const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;
                sendBannerIdToLambda(bannerId);
            });
        }
    }, [persons]);

    return (
        <Fragment>
            {persons && (
                <div className={classes.card}>
                    {persons.map((person) => {
                        // const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;

                        return (
                            <Fragment key={person.id}>
                                {/* <Table stickyHeader className={classes.table}>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Banner Id:</TableCell>
                                            <TableCell align="Left">{bannerId}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table> */}
                                {canvasData.length > 0 ? (
                                    <Table striped bordered hover>
                                        <TableBody>
                                            {canvasData.map(todo => (
                                                <TableRow key={todo.assignment.id}>
                                                    <TableCell style={columnStyles}>
                                                        <strong>Assignment:</strong> {todo.context_name}<br />
                                                        {/* <strong>Assignment:</strong> {todo.assignment.description}<br /> */}
                                                        <strong>Due:</strong> {new Date(todo.assignment.due_at).toLocaleDateString()}<br />
                                                        {/* <strong>Points Possible:</strong> {todo.assignment.points_possible} */}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className={classes.text}>
                                        Opportunity starts here!
                                        <div style={{ marginTop: '20px' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                href="https://www.uiw.edu/admissions/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Enroll Now
                                            </Button>
                                        </div>
                                    </div>
                                )}

                            </Fragment>
                        );
                    })}
                </div>
            )}
            {!persons && (
                <div className={classes.text}>
                    {intl.formatMessage({ id: 'PersonInformationCard-noSelectedPerson' })}
                </div>
            )}
        </Fragment>
    );
};

CanvasCard.propTypes = {
    cardControl: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
};

function CanvasCardWrapper(props) {
    return (
        <IntlProvider locale="en">
            <CanvasCard {...props} />
        </IntlProvider>
    );
}

export default (withStyles(styles)(CanvasCardWrapper));
