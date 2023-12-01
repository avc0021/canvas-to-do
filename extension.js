module.exports = {
    name: 'Canvas To Do',
    publisher: 'University of the Incarnate Word',
    cards: [{
        type: 'CanvasToDo',
        source: './src/cards/ToDoItemsList',
        title: 'CanvasToDo',
        displayCardType: 'CanvasToDo',
        description: 'This card displays a listing of To Do items from Canvas',
        queries: {
            'list-persons': [
                {
                    resourceVersions: {
                        persons: { min: 12 }
                    },
                    query:
                        `query listPerson($personId: ID){
                            persons: {persons} (
                                filter: {id: {EQ: $personId}}
                                ) 
                                {
                                    edges {
                                        node {
                                            id
                                                credentials {
                                                    type
                                                    value
                                                }
                                                names {
                                                    firstName
                                                    lastName
                                                    middleName
                                                    preference
                                                    fullName
                                                }
                                                emails {
                                                    type {
                                                        emailType
                                                    }
                                                    address
                                                    preference
                                                }
                                        }
                                    }
                                }
                        }`
                }
            ]
        },
    }],
    page: {
        source: './src/page/router.jsx'
    }
};