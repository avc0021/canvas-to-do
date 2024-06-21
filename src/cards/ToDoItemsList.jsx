import React, { useEffect, useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableRow, TextLink } from '@ellucian/react-design-system/core';
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

// Styles for the card and TextLink hover
const styles = () => ({
    card: {
        marginRight: spacing40,
        marginLeft: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    },
    link: {
        color: 'black',
        textDecoration: 'none',
        '&:hover': {
            color: '#aa1010',
            textDecoration: 'none'
        }
    },
    dueToday: {
        fontWeight: 'bold',
        color: '#aa1010'
    },
    dueSoon: {
        color: '#aa1010'
    }
});

const cacheKey = 'graphql-card:persons';

// Function to check if a date is today
const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

// Function to check if a date is 2-3 days from today
const isDueSoon = (someDate) => {
    const today = new Date();
    const timeDiff = someDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff === 2 || dayDiff === 3;
};

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

    // Enable this code after testing and comment out the next useEffect from 126-135
    // useEffect(() => {
    //     if (persons && persons.length > 0) {
    //         persons.forEach(person => {
    //             const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;
    //             sendBannerIdToLambda(bannerId);
    //         });
    //     }
    // }, [persons]);

    useEffect(() => {
        if (persons && persons.length > 0) {
            // Temporary hardcoded dummy bannerId for testing
            const dummyBannerId = 'W01331081';
            // Send the dummyBannerId for each person without using the person variable
            persons.forEach(() => {
                sendBannerIdToLambda(dummyBannerId);
            });
        }
    }, [persons]);

    const handleNavigate = (event) => {
        event.preventDefault(); // Prevents the default action of the event
        window.open('https://canvas.uiw.edu/', '_blank');
    };

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
                                                        <TextLink
                                                            className={classes.link}
                                                            onClick={(e) => handleNavigate(e, todo.assignment)}
                                                        >
                                                            {todo.context_name.replace(/&/g, ' & ')}
                                                        </TextLink>
                                                        <br />
                                                        <strong>Due:</strong> 
                                                        <span className={
                                                            isToday(new Date(todo.assignment.due_at)) ? classes.dueToday : 
                                                                isDueSoon(new Date(todo.assignment.due_at)) ? classes.dueSoon : ''
                                                        }>
                                                            {new Date(todo.assignment.due_at).toLocaleDateString()}
                                                        </span>
                                                        <br />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className={classes.text}>
                                        <p>There are no items at this time.</p>
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            )}
            {
                !persons && (
                    <div className={classes.text}>
                        {intl.formatMessage({ id: 'PersonInformationCard-noSelectedPerson' })}
                    </div>
                )
            }
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

export default withStyles(styles)(CanvasCardWrapper);
