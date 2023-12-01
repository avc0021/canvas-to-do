import React, { useEffect, useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableRow, TextLink } from '@ellucian/react-design-system/core';
import { spacing40, spacing10 } from '@ellucian/react-design-system/core/styles/tokens';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';


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
        cardControl: { setLoadingStatus, setErrorMessage},
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

    const handleNavigate = (event) => {
        event.preventDefault(); // Prevents the default action of the event
        window.open('https://canvas.uiw.edu/', '_blank');
    };


    // const handleNavigate = (event, assignment) => {
    //     event.stopPropagation(); // This prevents the event from bubbling up to parent elements
    //     console.log('Navigating with assignment:', assignment);


    //     navigateToPage({
    //         route: `/assignment-details/${assignment.id}`,
    //         state: { assignmentDetails: assignment }
    //     });
    // };

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
                                    <Table striped='true' bordered='true'>
                                        <TableBody>
                                            {canvasData.map(todo => (
                                                <TableRow key={todo.assignment.id}>
                                                    <TableCell style={columnStyles}>
                                                        <strong>Assignment:</strong>
                                                        <TextLink onClick={(e) => handleNavigate(e, todo.assignment)}>
                                                            {todo.context_name}
                                                        </TextLink>
                                                        {/* <TextLink onClick={(e) => handleNavigate(e, todo.assignment)}>
                                                            {todo.context_name}
                                                        </TextLink> */}
                                                        <br />
                                                        <strong>Due:</strong> {new Date(todo.assignment.due_at).toLocaleDateString()}<br />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div>
                                        <p>We apologize for the inconvenience. There seems to be an issue.</p>
                                        <p>Please email <a href="mailto:webteam@uiwtx.edu">webteam@uiwtx.edu</a> with the following information:</p>
                                        <ul>
                                            <li>A screenshot of the issue you&apos;re facing.</li>
                                            <li>The device you are using.</li>
                                            <li>The browser you are on.</li>
                                            <li>Any other information you think might be useful.</li>
                                        </ul>
                                    </div>
                                )}

                            </Fragment>
                        );
                    })}
                </div>
            )
            }
            {
                !persons && (
                    <div className={classes.text}>
                        {intl.formatMessage({ id: 'PersonInformationCard-noSelectedPerson' })}
                    </div>
                )
            }
        </Fragment >
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
