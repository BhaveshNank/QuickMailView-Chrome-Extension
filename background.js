chrome.runtime.onInstalled.addListener(() => {
    console.log("Email Organizer & Smart Labeler Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getEmails') {
        console.log("Received message to fetch emails");
        fetchEmails(); // Ensure fetchEmails is defined and functional
        sendResponse({status: "Emails fetched"});
    }
});

// The fetchEmails function
async function fetchEmails() {
    const emails = [
        { id: '1', subject: 'Meeting Reminder', content: 'Don\'t forget our meeting at 3 PM.', read: false },
        { id: '2', subject: 'Project Update', content: 'Here is the latest update on the project...', read: false }
    ];

    // Use Promise.all to summarize all emails asynchronously
    const summarizedEmails = await Promise.all(emails.map(async (email) => {
        const summary = await summarizeEmails(email.content);
        return {
            ...email,
            summary
        };
    }));

    // Store summarized emails in local storage
    chrome.storage.local.set({ emails: summarizedEmails }, () => {
        console.log("Emails summarized and stored");
    });
}

// The summarizeEmails function
async function summarizeEmails(emailContent) {
    if (!emailContent) {
        return "No content to summarize.";
    }

    const apiUrl = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";
  // The Hugging Face model for summarization
    const apiToken = "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";  // Replace this with your actual Hugging Face token

    const headers = {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
    };

    const body = JSON.stringify({
        "inputs": emailContent  // The email content to be summarized
    });

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: body
        });

        const result = await response.json();

        // Log the response to understand what's returned
        console.log("Hugging Face API response:", JSON.stringify(result, null, 2));

        if (response.ok && result.length > 0 && result[0].hasOwnProperty('summary_text')) {
            return result[0].summary_text;  // Extract and return the summary text
        } else if (result.error) {
            console.error("Error summarizing email:", result.error.message);
            return "Summary not available due to API error.";
        } else {
            console.error("Unexpected response format:", result);
            return "Summary not available.";
        }
    } catch (error) {
        console.error("Error connecting to Hugging Face API:", error);
        return "Summary not available.";
    }
}


