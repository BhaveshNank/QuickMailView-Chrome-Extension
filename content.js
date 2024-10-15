console.log("Content script loaded");

// Example function to label emails based on simple rules
function categorizeEmail(emailContent, emailSubject) {
    if (emailSubject.includes("Meeting") || emailContent.includes("project")) {
        return "Work";
    } else if (emailContent.includes("discount") || emailSubject.includes("Sale")) {
        return "Promotions";
    } else {
        return "Personal";
    }
}

// Example email data (you'll later replace this with API data from Gmail/Outlook)
const emails = [
    { id: '1', subject: 'Meeting Reminder', content: 'Don\'t forget our meeting at 3 PM.', read: false },
    { id: '2', subject: 'Project Update', content: 'Here is the latest update on the project...', read: false },
    { id: '3', subject: '50% Off Sale', content: 'Grab your discount before it ends!', read: true }
];

// Categorize emails and store them
emails.forEach(email => {
    email.label = categorizeEmail(email.content, email.subject);
});

// Listen for messages from the popup to get categorized emails
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCategorizedEmails") {
        chrome.storage.local.get(["emails"], (result) => {
            sendResponse(result.emails || []);
        });
    }
});

// Save categorized emails to local storage
chrome.storage.local.set({ emails });
