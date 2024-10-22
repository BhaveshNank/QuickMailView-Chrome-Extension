console.log("Content script loaded and running on the page!");
// Function to authenticate and fetch real emails from Gmail
function fetchEmails() {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        if (chrome.runtime.lastError) {
            console.error("Authentication error:", chrome.runtime.lastError.message);
            return;
        }

        console.log('Got auth token:', token); // Log token for verification
        console.log('Email IDs fetched:', data);

        // Fetch the emails using Gmail API
        fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Email IDs fetched:', data); // Log the fetched email data

            if (!data.messages) {
                console.error('No messages found.');
                return;
            }

            const messageIds = data.messages.map(message => message.id);
            // Fetch the details of each email using their message ID
            return Promise.all(messageIds.map(id => fetchMessageDetails(id, token)));
        })
        .then(messages => {
            console.log('Email details fetched:', messages); // Log the full email details
            // Store emails in local storage
            chrome.storage.local.set({ emails: messages });
        })
        .catch(error => console.error('Error fetching emails:', error));
    });
}

// Function to fetch message details by message ID
function fetchMessageDetails(id, token) {
    return fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        // Extract the subject and snippet of each email
        const subjectHeader = data.payload.headers.find(header => header.name === 'Subject');
        const subject = subjectHeader ? subjectHeader.value : 'No Subject';
        const snippet = data.snippet;

        return {
            id: data.id,
            subject: subject,
            snippet: snippet
        };
    });
}

// Listen for messages from the popup.js file
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getEmails") {
        fetchEmails();
        sendResponse({status: "Emails are being fetched"});
    }
});
