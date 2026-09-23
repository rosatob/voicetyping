const textBox = document.getElementById('textBox');
const recordBtn = document.getElementById('recordBtn');
const statusDiv = document.getElementById('status');

// Replace with your deployed Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/a/macros/sfusd.edu/s/AKfycbxOV029qX2Tax3c47E1S2A-eq_hdj9KsWN6X_2j6qSjzXho9noRgyiJuDDL2jePzvMY/exec';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    statusDiv.textContent = 'Status: Speech recognition is not supported in this browser.';
    recordBtn.disabled = true;
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // Show words as you speak
    recognition.continuous = true;   // Keep listening until stopped

    let isRecording = false;
    let finalTranscript = '';

    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });

    recognition.onstart = () => {
        isRecording = true;
        recordBtn.textContent = 'Stop Recording';
        statusDiv.textContent = 'Status: Listening...';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        textBox.value = finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        statusDiv.textContent = `Status: Error occurred - ${event.error}`;
    };

    recognition.onend = () => {
        isRecording = false;
        recordBtn.textContent = 'Start Recording';
        statusDiv.textContent = 'Status: Processing and sending to Apps Script...';
        
        // Send final text to Google Apps Script Web App via POST
        sendDataToAppsScript(textBox.value.trim());
    };
}

function sendDataToAppsScript(text) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for standard Google Apps Script web app endpoints unless handling CORS preflights explicitly
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text })
    })
    .then(() => {
        statusDiv.textContent = 'Status: Sent to Google Apps Script successfully!';
    })
    .catch((error) => {
        statusDiv.textContent = `Status: Failed to send - ${error}`;
    });
}
