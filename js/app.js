const defaultDevices = [
    {
        id: 1,
        name: `Gigabyte G6 MF`,
        description: `Основной ноутбук`,
        os: `Windows 11`,
        details: [
            `Процессор: Intel Core i5-13500H`,
            `Оперативная память: 16 ГБ`
        ],
        status: `Online`,
        image: `assets/images/g6mf.jpg`,
        alt: `Ноутбук Gigabyte G6 MF`
    },

    {
        id: 2,
        name: `Acer Aspire A315-53G`,
        description: `Старый ноутбук`,
        os: `Windows 10 / Linux`,
        details: [
            `Процессор: Intel Core i3-8130U`,
            `Оперативная память: 8 ГБ`
        ],
        status: `Offline`,
        image: `assets/images/acera3.jpg`,
        alt: `Acer Aspire A315-53G`
    },

    {
        id: 3,
        name: `Desktop PC`,
        description: `Старый пк`,
        os: `Windows XP / Linux`,
        details: [
            `Тип: Desktop`,
            `Оперативная память: 256 Мб`
        ],
        status: `Offline`,
        image: `assets/images/dt.jpg`,
        alt: `Desktop PC`
    },

    {
        id: 4,
        name: `Virtual Machine`,
        description: `Виртуальная машина`,
        os: `Debian Linux`,
        details: [
            `Тип: Virtual Machine`,
            `Назначение: Тестирование`
        ],
        status: `Offline`,
        image: `assets/images/vm.jpg`,
        alt: `Virtual Machine`
    },

    {
        id: 5,
        name: `Ubuntu Environment`,
        description: `Linux-среда`,
        os: `Ubuntu Linux`,
        details: [
            `Тип: Linux Environment`,
            `Назначение: Разработка`
        ],
        status: `Offline`,
        image: `assets/images/uvm.jpg`,
        alt: `Ubuntu Environment`
    },

    {
        id: 6,
        name: `Test Node`,
        description: `Тестовый узел`,
        os: `Linux`,
        details: [
            `Тип: Test Node`,
            `Назначение: Эксперименты`
        ],
        status: `Offline`,
        image: `assets/images/tn.jpg`,
        alt: `Test Node`
    }
];
const state = {
    devices: [...defaultDevices],
    searchQuery: ``,
    selectedOS: `all`,
    sortBy: `name-asc`
};

const deviceList = document.querySelector(`#device-list`);
const searchInput = document.querySelector(`#device-name`);
const osSelect = document.querySelector(`#os`);
const sortSelect = document.querySelector(`#sort`);
const searchForm = document.querySelector(`form`);

function createParagraph(text) {
    const paragraph = document.createElement(`p`);
    paragraph.textContent = text;

    return paragraph;

}

function getVisibleDevices() {
    let devices = [...state.devices];

    if (state.searchQuery !== ``){
        devices = device.filter((device) => 
           device.name
                .toLoweerCase()
                .includes(state.searchQery.toLowerCase())
        );
    }

    if (state.selectedOS !== `all`) {
        devices = devices.filter((device) =>
                device.os
                    .toLowerCase()
                    .includes(state.selectedOS)
        );
    }

    if (state.sortBy === `name-asc`) {
        devices.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }
        
    if (state.sortBy === `name-desc`) {
        devices.sort((a, b) =>
            b.name.localeCompare(a.name)
        );
    }

    return devices;
}

function render() {
    deviceList.replaceChildren();

    const getVisibleDevices = getVisibleDevices();

    state.devices.forEach((device) => {
        const article = document.createElement(`article`);
        article.className = `device-card`;
        
        const image = document.createElement(`img`);
        image.src = device.image;
        image.alt = device.alt;
        
        const title = document.createElement(`h3`);
        title.textContent = device.name;
    
        const description = createParagraph(device.description);
        const os = createParagraph(`ОС: ${device.os}`);
        
        article.append(
                image,
                title,
                description,
                os
        );
        device.details.forEach((detail) => {
            article.append(createParagraph(detail));
        });
        const status = createParagraph(`Статус: ${device.status}`);
        article.append(status);
        
        deviceList.append(article);
        });
    }

    searchInput.addEventListener(`input`, (event) => {
        state.searchQuery = event.target.value;
        render();
    });

    osSelect.addEventListener(`change`, (event) => {
        state.selectedOS = event.target.value;
        render();
    });

    sortSelect.addEventListener(`change`, (event) => {
        state.sortBy = event.target.value;
        render();
    });

    searchForm.addEventListener(`submit`, (event) => {
        event.preventDefault();
    });
render();