var DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];

var SCOPES = "https://www.googleapis.com/auth/calendar";

function handleClientLoad(fallback = () => {}) {
    gapi.load("client:auth2", (e) => initClient(fallback));
}

function initClient(fallback) {
    gapi.client
        .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        })
        .then(
            function () {
                // Listen for sign-in state changes.
                gapi.auth2
                    .getAuthInstance()
                    .isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(
                    gapi.auth2.getAuthInstance().isSignedIn.get()
                );
                signInBtn.onclick = handleAuthClick;
                signOutBtn.onclick = handleSignoutClick;
                fallback();
            },
            function (error) {
                appendPre(JSON.stringify(error, null, 2));
            }
        );
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function sleep(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

function pushToCalendar(
    calendarId,
    { summary, description, startDateTime, endDateTime }
) {
    return new Promise((resolve, reject) => {
        var event = {
            summary: summary,
            description: description,
            start: {
                dateTime: startDateTime,
            },
            end: {
                dateTime: endDateTime,
            },
        };

        var request = gapi.client.calendar.events.insert({
            calendarId: calendarId,
            resource: event,
        });

        request.execute(function (response) {
            resolve(response);
        });
    });
}

function getEvents(calendarId, nextPageToken) {
    return new Promise((resolve, reject) => {
        // console.log(`Using page token ${nextPageToken}`);
        gapi.client.calendar.events
            .list({
                calendarId: calendarId,
                timeMin: new Date(0).toISOString(),
                showDeleted: false,
                singleEvents: true,
                maxResults: 100,
                orderBy: "startTime",
                pageToken: nextPageToken,
            })
            .then(function (response) {
                resolve(response);
            });
    });
}

async function getCalendarList() {
    var response = await gapi.client.calendar.calendarList.list();
    var list = response.result.items;
    return list;
}

async function getAllEvents(calendarId) {
    let done = false;
    let events = [];
    let pageToken;
    while (!done) {
        var response = await getEvents(calendarId, pageToken);
        events = [...events, ...response.result.items];

        if (pageToken == response.result.nextPageToken) break;
        if (!response.result.nextPageToken) {
            done = true;
        } else {
            pageToken = response.result.nextPageToken;
            console.log(`Got next page: ${pageToken}`);
        }
        // console.log("test");
        // done = true;
    }
    return events;
}
function removeEventFromCalendar(calendarId, eventId) {
    let request = gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
    });
    return new Promise((resolve, reject) => {
        request.execute(function (event) {
            // console.log(`Removed Event with ID ${eventId}`);
            resolve(event);
        });
    });
}

function getUserInfo() {
    var auth2 = gapi.auth2.getAuthInstance();
    if (!auth2.isSignedIn.get()) return;
    var profile = auth2.currentUser.get().getBasicProfile();
    var name = profile.getName();
    var email = profile.getEmail();
    var imageUrl = profile.getImageUrl();
    var id = profile.getId();
    var givenName = profile.getGivenName();
    var familyName = profile.getFamilyName();
    return { name, email, imageUrl, id, givenName, familyName };
}
