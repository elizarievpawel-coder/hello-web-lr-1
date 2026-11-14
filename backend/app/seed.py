"""Demo devices are inserted once, only when the database table is first created."""
from app.models import Device

DEFAULT_DEVICES = [
    Device(name="Gigabyte G6 MF", description="Основной ноутбук", os="Windows 11",
           details=["Процессор: Intel Core i5-13500H", "Оперативная память: 16 ГБ"],
           status="Online", image="assets/images/g6mf.jpg", alt="Ноутбук Gigabyte G6 MF"),
    Device(name="Acer Aspire A315-53G", description="Старый ноутбук", os="Windows 10 / Linux",
           details=["Процессор: Intel Core i3-8130U", "Оперативная память: 8 ГБ"],
           status="Offline", image="assets/images/acera3.jpg", alt="Ноутбук Acer Aspire A315-53G"),
    Device(name="Desktop PC", description="Старый ПК", os="Windows XP / Linux",
           details=["Тип: Desktop", "Оперативная память: 256 Мб"],
           status="Offline", image="assets/images/dt.jpg", alt="Desktop PC"),
    Device(name="Virtual Machine", description="Виртуальная машина", os="Debian Linux",
           details=["Тип: Virtual Machine", "Назначение: Тестирование"],
           status="Offline", image="assets/images/vm.jpg", alt="Virtual Machine"),
    Device(name="Ubuntu Environment", description="Linux-среда", os="Ubuntu Linux",
           details=["Тип: Linux Environment", "Назначение: Разработка"],
           status="Offline", image="assets/images/uvm.jpg", alt="Ubuntu Environment"),
    Device(name="Test Node", description="Тестовый узел", os="Linux",
           details=["Тип: Test Node", "Назначение: Эксперименты"],
           status="Offline", image="assets/images/tn.jpg", alt="Test Node"),
]
