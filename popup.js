console.log("Popup loaded");

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('organizeBtn').addEventListener('click', () => {
        // Send message to background.js to fetch and summarize emails
        chrome.runtime.sendMessage({ action: 'getEmails' }, (response) => {
            console.log(response.status); // This should print 'Emails fetched'
            // Retrieve summarized emails from storage
            displayEmails();
        });
    });
});

function displayEmails() {
    chrome.storage.local.get(['emails'], (result) => {
        const emailList = document.getElementById('emailList');
        emailList.innerHTML = ""; // Clear previous entries

        const emails = result.emails || [];
        emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = 'email-item';
            emailItem.innerHTML = `
                <strong>Label: ${categorizeEmail(email.subject)}</strong>
                <p><strong>${email.subject}</strong></p>
                <p>${email.summary}</p>
            `;
            emailList.appendChild(emailItem);
        });
    });
}

function categorizeEmail(subject) {
    if (subject.toLowerCase().includes("urgent")) {
        return "High Priority";
    } else if (subject.toLowerCase().includes("meeting")) {
        return "Meeting";
    } else {
        return "General";
    }
}
