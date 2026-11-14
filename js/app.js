/* Personal Control Center — lab 3: frontend data comes from FastAPI. */
const state = {
    devices: [],
    searchQuery: "",
    selectedOS: "all",
    sortBy: "name-asc"
};

const deviceList = document.querySelector("#device-list");
const searchInput = document.querySelector("#device-name");
const osSelect = document.querySelector("#os");
const sortSelect = document.querySelector("#sort");
const searchForm = document.querySelector("#filter-form");
const deviceModal = document.querySelector("#device-modal");
const openModalButton = document.querySelector("#open-device-modal");
const closeModalButton = document.querySelector("#close-device-modal");
const cancelModalButton = document.querySelector("#cancel-device-modal");
const addDeviceForm = document.querySelector("#add-device-form");
const nameInput = document.querySelector("#new-device-name");
const osInput = document.querySelector("#new-device-os");
const descriptionInput = document.querySelector("#new-device-description");
const ramInput = document.querySelector("#new-device-ram");
const detailsInput = document.querySelector("#new-device-details");
const statusSelect = document.querySelector("#new-device-status");
const nameError = document.querySelector("#name-error");
const osError = document.querySelector("#os-error");
const descriptionError = document.querySelector("#description-error");
const ramError = document.querySelector("#ram-error");
const feedback = document.querySelector("#feedback");

function showMessage(message, isError = false) {
    feedback.textContent = message;
    feedback.classList.toggle("error", isError);
}

async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers }
    });
    if (!response.ok) {
        let message = "Ошибка HTTP " + response.status;
        try {
            const errorBody = await response.json();
            if (typeof errorBody.detail === "string") {
                message += ": " + errorBody.detail;
            } else if (Array.isArray(errorBody.detail)) {
                message += ": " + errorBody.detail.map((item) => item.msg).join(", ");
            }
        } catch {
            // Non-JSON error response: keep the HTTP status.
        }
        throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
}

function createParagraph(value) {
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    return paragraph;
}

function getVisibleDevices() {
    const query = state.searchQuery.trim().toLowerCase();
    return state.devices
        .filter((device) => device.name.toLowerCase().includes(query))
        .filter((device) => state.selectedOS === "all" ||
            device.os.toLowerCase().includes(state.selectedOS))
        .slice()
        .sort((a, b) => state.sortBy === "name-desc"
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name));
}

function render() {
    deviceList.replaceChildren();
    const devices = getVisibleDevices();
    if (devices.length === 0) {
        deviceList.append(createParagraph("Устройства не найдены."));
        return;
    }

    devices.forEach((device) => {
        const article = document.createElement("article");
        article.className = "device-card";

        const image = document.createElement("img");
        image.src = device.image;
        image.alt = device.alt;

        const title = document.createElement("h3");
        title.textContent = device.name;

        article.append(
            image,
            title,
            createParagraph(device.description),
            createParagraph("ОС: " + device.os)
        );

        device.details.forEach((detail) => {
            article.append(createParagraph(detail));
        });

        const label = document.createElement("label");
        label.className = "status-control";
        label.textContent = "Статус (вручную)";
        const select = document.createElement("select");
        select.className = "device-status-select";
        select.dataset.id = device.id;
        select.setAttribute("aria-label", "Статус устройства " + device.name);
        ["Online", "Offline"].forEach((status) => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.append(option);
        });
        select.value = device.status;
        label.append(select);
        article.append(label);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-device";
        deleteButton.dataset.id = device.id;
        deleteButton.textContent = "Удалить";
        article.append(deleteButton);

        deviceList.append(article);
    });
}

async function loadDevices() {
    try {
        showMessage("Загружаю устройства с сервера...");
        state.devices = await apiRequest("/api/devices");
        render();
        showMessage("");
    } catch (error) {
        showMessage("Не удалось загрузить устройства. Проверь запуск сервера: " + error.message, true);
    }
}

searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    render();
});

osSelect.addEventListener("change", (event) => {
    state.selectedOS = event.target.value;
    render();
});

sortSelect.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    render();
});

searchForm.addEventListener("submit", (event) => event.preventDefault());

/* Event delegation: one click handler for all delete buttons. */
deviceList.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-device");
    if (!button) return;

    const id = Number(button.dataset.id);
    button.disabled = true;
    try {
        await apiRequest("/api/devices/" + id, { method: "DELETE" });
        state.devices = state.devices.filter((device) => device.id !== id);
        render();
        showMessage("Устройство удалено из базы данных.");
    } catch (error) {
        button.disabled = false;
        showMessage("Не удалось удалить устройство: " + error.message, true);
    }
});

/* Changing status calls PATCH and writes to the database. */
deviceList.addEventListener("change", async (event) => {
    const select = event.target.closest(".device-status-select");
    if (!select) return;

    const id = Number(select.dataset.id);
    select.disabled = true;
    try {
        const updated = await apiRequest("/api/devices/" + id, {
            method: "PATCH",
            body: JSON.stringify({ status: select.value })
        });
        state.devices = state.devices.map((device) => device.id === id ? updated : device);
        render();
        showMessage("Статус сохранён в базе данных.");
    } catch (error) {
        render();
        showMessage("Не удалось изменить статус: " + error.message, true);
    }
});

openModalButton.addEventListener("click", () => deviceModal.showModal());
closeModalButton.addEventListener("click", () => deviceModal.close());
cancelModalButton.addEventListener("click", () => deviceModal.close());
deviceModal.addEventListener("click", (event) => {
    if (event.target === deviceModal) deviceModal.close();
});

function validateField(input, errorElement) {
    const text = input.value.trim();
    let message = "";

    if (text === "") {
        message = "Это поле обязательно для заполнения";
    } else if (input.type === "number") {
        if (!input.validity.valid || !Number.isInteger(Number(text))) {
            message = "Введите целое число от " + input.min + " до " + input.max;
        }
    } else if (text.length < input.minLength) {
        message = "Минимальная длина — " + input.minLength + " символа";
    } else if (text.length > input.maxLength) {
        message = "Максимальная длина — " + input.maxLength + " символов";
    }
    errorElement.textContent = message;
    return message === "";
}

addDeviceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fields = [
        [nameInput, nameError],
        [osInput, osError],
        [descriptionInput, descriptionError],
        [ramInput, ramError]
    ];
    const valid = fields.map(([input, error]) => validateField(input, error)).every(Boolean);
    if (!valid) return;

    const submitButton = addDeviceForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const name = nameInput.value.trim();
    const payload = {
        name,
        description: descriptionInput.value.trim(),
        os: osInput.value.trim(),
        details: [
            "Оперативная память: " + Number(ramInput.value) + " ГБ",
            ...detailsInput.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        ],
        status: statusSelect.value,
        image: "assets/images/tn.jpg",
        alt: "Изображение устройства " + name
    };
    try {
        const created = await apiRequest("/api/devices", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        state.devices.push(created);
        render();
        addDeviceForm.reset();
        fields.forEach(([, error]) => error.textContent = "");
        deviceModal.close();
        showMessage("Устройство добавлено в базу данных.");
    } catch (error) {
        showMessage("Не удалось добавить устройство: " + error.message, true);
    } finally {
        submitButton.disabled = false;
    }
});

render();
loadDevices();
