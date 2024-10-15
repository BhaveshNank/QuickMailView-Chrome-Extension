document.getElementById("organizeBtn").addEventListener("click", () => {
    chrome.storage.local.get(['emails'], (result) => {
        const emailList = document.getElementById('emailList');
        emailList.innerHTML = ""; // Clear any previous entries
        const emails = result.emails || [];

        emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = `email-item ${email.read ? 'read' : ''}`;
            emailItem.innerHTML = `
                <span class="label">Label: ${email.label}</span>
                <strong>${email.subject}</strong>
                <p>${email.content}</p>
                <button onclick="viewEmail('${email.id}')">View Email</button>
            `;
            emailList.appendChild(emailItem);
        });
    });
});

function viewEmail(id) {
    alert(`Opening email with ID: ${id}`);
}
