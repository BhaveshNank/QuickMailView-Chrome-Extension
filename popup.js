console.log("Content script loaded");

document.addEventListener('DOMContentLoaded', function() {
  // Attach event listener to the "Organize Emails" button
  document.getElementById('organizeBtn').addEventListener('click', () => {
      // Send message to content script to fetch emails
      chrome.runtime.sendMessage({action: "getEmails"}, (response) => {
          console.log(response.status); // Log the status of email fetch operation

          // Now retrieve the emails from local storage and display them
          chrome.storage.local.get(['emails'], (result) => {
              const emailList = document.getElementById('emailList');
              emailList.innerHTML = ""; // Clear the list before adding emails

              const emails = result.emails || [];
              if (emails.length === 0) {
                  emailList.innerHTML = "<p>No emails fetched yet</p>";
              } else {
                  emails.forEach(email => {
                      const emailItem = document.createElement('div');
                      emailItem.className = 'email-item';
                      emailItem.innerHTML = `
                          <strong>Label: ${categorizeEmail(email.subject)}</strong>
                          <p>${email.summary}</p>
                          <button onclick="viewEmail('${email.id}')">View</button>
                      `;
                      emailList.appendChild(emailItem);
                  });
              }
          });
      });
  });
});

function categorizeEmail(subject) {
    // Example categorization logic based on subject
    if (subject.includes("urgent")) {
        return "High Priority";
    } else if (subject.includes("meeting")) {
        return "Meeting";
    } else {
        return "General";
    }
}

function viewEmail(id) {
    // Logic to open the email
    alert(`Opening email with ID: ${id}`);
}

function summarizeEmails(emailContent) {
    // Your summarization logic here
    return "This is a summary of your emails.";
}

function fetchEmails() {
    // Example function to fetch emails
    const emails = [
        { id: '1', subject: 'Meeting Reminder', content: 'Don\'t forget our meeting at 3 PM.', read: false },
        { id: '2', subject: 'Project Update', content: 'Here is the latest update on the project...', read: false }
    ];

    // Summarize emails
    emails.forEach(email => {
        email.summary = summarizeEmails(email.content);
    });

    // Store emails in local storage
    chrome.storage.local.set({ emails }, () => {
        chrome.runtime.sendMessage({ status: "Emails fetched and summarized" });
    });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getEmails") {
        fetchEmails();
        sendResponse({ status: "Fetching emails" });
    }
});
