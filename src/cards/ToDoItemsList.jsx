import React, { useEffect, useState, Fragment } from 'react';
import { TextLink } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import PropTypes from 'prop-types';
import { useIntl, IntlProvider } from 'react-intl';

// Styles for the card and assignments
const styles = () => ({
    card: {
        backgroundColor: '#ffffff',
        color: '#000000',
        width: '100%',
        height: '100%',
        // padding: '20px',
        textAlign: 'center',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    assignments: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflowY: 'auto'
    },
    assignment: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontSize: '0.875rem',
        padding: '10px',
        border: '1px solid #aa1010',
        borderRadius: '5px',
        textAlign: 'left'
    },
    assignmentDue: {
        backgroundColor: '#aa1010',
        color: '#ffffff',
    },
    link: {
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
            color: 'inherit'
        }
    },
    linkDue: {
        color: 'inherit',
    },
});

const cacheKey = 'graphql-card:persons';

// Function to check if a date is today
const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

// Function to check if a date is 1-2 days from today
const isDueSoon = (someDate) => {
    const today = new Date();
    const timeDiff = someDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff === 1 || dayDiff === 2;
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
        const endpoint = `https://fk71tl9cn0.execute-api.us-east-2.amazonaws.com/default/canvas_to_do?bannerId=${bannerId}`;

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

    // Enable this code after testing and comment out the next useEffect from 126-135, if needed Adjust Card Styles in GPT. 
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
                    <div className={classes.assignments}>
                        {persons.map((person) => {
                            return (
                                <Fragment key={person.id}>
                                    {canvasData.length > 0 ? (
                                        canvasData.map(todo => {
                                            const dueDate = new Date(todo.assignment.due_at);
                                            const isSoon = isDueSoon(dueDate);
                                            const isDue = isToday(dueDate) || isSoon;
                                            return (
                                                <div
                                                    key={todo.assignment.id}
                                                    className={`${classes.assignment} ${isDue ? classes.assignmentDue : ''}`}
                                                >
                                                    <strong>Assignment: </strong>
                                                    <TextLink
                                                        className={`${classes.link} ${isDue ? classes.linkDue : ''}`}
                                                        onClick={(e) => handleNavigate(e, todo.assignment)}
                                                    >
                                                        {todo.context_name.replace(/&/g, ' & ')}
                                                    </TextLink><br />
                                                    <strong>Due:</strong> <span>{dueDate.toLocaleDateString()}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className={classes.text}>
                                            <p>There are no items at this time.</p>
                                        </div>
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
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
