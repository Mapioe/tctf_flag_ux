console.log("Extension loaded");


const message_status_mapper = {
    200: "Флаг успешно принят",
    202: "Флаг уже был сдан раннее",
    401: "Авторизуйтесь",
    404: "Флаг неверный",
    default: 'Что-то непонятное с флагом'
}

const map_response_code = (code) => {
    return message_status_mapper[code] || message_status_mapper.default
}


chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.method === "POST" && details.url.includes("tbank.mshp-ctf.ru/api/tasks/submit_flag")) {

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'https://tbank.mshp-ctf.ru/static/kksctf_logo_32.png',
                title: `${map_response_code(details.statusCode)}`,
                message: `Получен ответ от сервера: ${details.statusCode}`,
                priority: 1
            });

        }
    },
    {urls: ["<all_urls>"]},
    ["responseHeaders"]
);


