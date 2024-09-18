document.addEventListener('DOMContentLoaded', function() {
    const api_key_input = document.getElementById('apiKey');
    const save_button = document.getElementById('saveButton');
    const status_element = document.getElementById('status');

    chrome.storage.sync.get('apiKey', function(data) {
        if (data.apiKey) {
            api_key_input.value = data.apiKey;
        }
    });

    save_button.addEventListener('click', function() {
        console.log("CLICKED");
        const apiKey = api_key_input.value;
        chrome.storage.sync.set({apiKey: apiKey}, function() {
            status_element.textContent = 'API key saved successfully!';
            setTimeout(() => {
                status_element.textContent = '';
            }, 4000);
        });
    });
});