    document.addEventListener('DOMContentLoaded', function() {
    // ===== ПЕРЕМЕННЫЕ И КОНСТАНТЫ =====
    const pageTransition = document.getElementById('page-transition');
    const phoneButton = document.getElementById('phoneButton');
    const phoneTooltip = document.getElementById('phoneTooltip');
    const pages = document.querySelectorAll('.page');
    
    // ===== НАВИГАЦИЯ =====
    const navLinks = document.querySelectorAll('.nav-link, .calculator-btn, #calculator-btn-main, #back-to-main');
    
    // Функция для переключения страниц с анимацией
    function switchPage(targetPageId) {
        // Скрыть подсказку телефона при переключении страниц
        if (phoneTooltip) {
            phoneTooltip.classList.remove('show');
        }
        
        // Активируем анимацию перехода
        if (pageTransition) {
            pageTransition.classList.add('active');
        }
        
        // Через 0.5 секунды (время анимации) меняем страницу
        setTimeout(() => {
            // Скрываем все страницы
            pages.forEach(page => {
                page.classList.add('hidden');
                page.classList.remove('active');
            });
            
            // Показываем целевую страницу
            const targetPage = document.getElementById(targetPageId);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                targetPage.classList.add('active');
                
                // Если переключились на страницу контактов - инициализируем кнопку
                if (targetPageId === 'contacts-page') {
                    setTimeout(initContactButton, 100);
                }
            }
            
            // Убираем анимацию перехода
            setTimeout(() => {
                if (pageTransition) {
                    pageTransition.classList.remove('active');
                }
            }, 50);
        }, 500);
    }
    
    // Обработчики для навигационных ссылок
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            let targetPageId;
            
            // Определяем целевую страницу
            if (this.classList.contains('calculator-btn') || 
                this.id === 'calculator-btn-main') {
                targetPageId = 'calculator-page';
            } else if (this.id === 'back-to-main') {
                targetPageId = 'main-page';
            } else {
                // Для обычных ссылок в меню
                const href = this.getAttribute('href');
                if (href) {
                    targetPageId = href.substring(1);
                }
            }
            
            // Переключаем страницу
            if (targetPageId) {
                switchPage(targetPageId);
            }
            
            // Прокрутка к верху страницы
            window.scrollTo(0, 0);
        });
    });
    
    // ===== КНОПКА ТЕЛЕФОНА =====
    if (phoneButton && phoneTooltip) {
        // Показать/скрыть подсказку телефона
        phoneButton.addEventListener('click', function() {
            phoneTooltip.classList.toggle('show');
        });
        
        // Закрыть подсказку при клике вне ее
        document.addEventListener('click', function(event) {
            if (!phoneButton.contains(event.target) && !phoneTooltip.contains(event.target)) {
                phoneTooltip.classList.remove('show');
            }
        });
    }
    
    // ===== КАЛЬКУЛЯТОР =====
    const calculatorForm = document.getElementById('calculator-form');
    const calculatorResult = document.getElementById('calculator-result');
    
    if (calculatorForm && calculatorResult) {
        // Базовая стоимость за км в зависимости от типа подвижного состава
        const basePrices = {
            'container': 85,
            'container40': 130,
            'tank': 160,
            'wagon': 210,
            'platform': 190,
            'cistern': 230,
            'gondola': 200  // Полувагон
        };
        
        // Коэффициенты для разных типов грузов (ЕТСНГ)
        const cargoCoefficients = {
            '010000': 1.0,   // Зерновые
            '031000': 1.2,   // Уголь
            '053000': 1.5,   // Нефть
            '121000': 1.1,   // Лесоматериалы
            '311000': 1.3,   // Черные металлы
            '411000': 1.0,   // Цемент
            '531000': 1.4,   // Удобрения
            '661000': 1.6,   // Автомобили
            '681000': 1.0,   // Контейнеры
            '911000': 1.2    // Прочие
        };
        
        // Обработчик отправки формы калькулятора
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Получаем значения из формы
                const from = document.getElementById('from').value;
                const to = document.getElementById('to').value;
                const cargoType = document.getElementById('cargo-type').value;
                const cargoTypeSelect = document.getElementById('cargo-type');
                const vehicleType = document.getElementById('vehicle-type').value;
                const vehicleTypeSelect = document.getElementById('vehicle-type');
                const distance = parseFloat(document.getElementById('distance').value);
                const weight = parseFloat(document.getElementById('weight').value);
                
                // Проверка валидности данных
                if (!from || !to || !cargoType || !vehicleType || isNaN(distance) || isNaN(weight)) {
                    alert('Пожалуйста, заполните все обязательные поля корректно.');
                    return;
                }
                
                const cargoTypeText = cargoTypeSelect.options[cargoTypeSelect.selectedIndex].text;
                const vehicleTypeText = vehicleTypeSelect.options[vehicleTypeSelect.selectedIndex].text;
                
                // Рассчитываем стоимость
                const basePricePerKm = basePrices[vehicleType] || 100;
                const cargoCoefficient = cargoCoefficients[cargoType] || 1.0;
                let totalPrice = basePricePerKm * distance * cargoCoefficient;
                
                // Корректировка по весу
                if (weight > 60) {
                    totalPrice *= 1.3; // +30% за тяжелый груз
                } else if (weight > 40) {
                    totalPrice *= 1.2; // +20% за тяжелый груз
                } else if (weight > 20) {
                    totalPrice *= 1.1; // +10% за средний груз
                }
                
                // Форматируем результат
                const formattedPrice = new Intl.NumberFormat('ru-RU').format(Math.round(totalPrice));
                
                // Заполняем результат
                document.getElementById('route-from').textContent = from;
                document.getElementById('route-to').textContent = to;
                document.getElementById('result-cargo-type').textContent = cargoTypeText;
                document.getElementById('result-vehicle-type').textContent = vehicleTypeText;
                document.getElementById('result-distance').textContent = distance;
                document.getElementById('result-weight').textContent = weight;
                document.getElementById('result-price').textContent = formattedPrice + ' ₽';
                
                // Показываем результат
                calculatorResult.style.display = 'block';
                
                // Прокручиваем к результату
                calculatorResult.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Ошибка при расчете стоимости:', error);
                alert('Произошла ошибка при расчете стоимости. Пожалуйста, проверьте введенные данные.');
            }
        });
        
        // Инициализация начальных значений для калькулятора
        if (document.getElementById('distance')) {
            document.getElementById('distance').value = Math.floor(Math.random() * 3000) + 500;
            document.getElementById('weight').value = (Math.random() * 50 + 10).toFixed(1);
        }
    }
    
    // ===== ОБРАБОТКА ЯКОРНЫХ ССЫЛОК ПРИ ЗАГРУЗКЕ =====
    window.addEventListener('load', function() {
        const hash = window.location.hash;
        if (hash && hash !== '#main-page') {
            const targetPage = hash.substring(1);
            if (document.getElementById(targetPage)) {
                // Небольшая задержка для плавного перехода при загрузке
                setTimeout(() => {
                    switchPage(targetPage);
                    // Если сразу загружаемся на страницу контактов
                    if (targetPage === 'contacts-page') {
                        setTimeout(initContactButton, 600);
                    }
                }, 300);
            }
        }
        
        // Пробуем инициализировать кнопку при загрузке (на случай если страница контактов активна)
        setTimeout(initContactButton, 500);
    });
    
    // ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====
    
    // Функция для проверки поддержки backdrop-filter
    function checkBackdropFilterSupport() {
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(10px)';
        testElement.style.webkitBackdropFilter = 'blur(10px)';
        
        if (!testElement.style.backdropFilter && !testElement.style.webkitBackdropFilter) {
            // Если не поддерживается, добавляем fallback стиль
            const header = document.querySelector('.header');
            if (header) {
                header.style.backgroundColor = 'rgba(10, 25, 47, 0.98)';
            }
        }
    }
    
    // Проверяем поддержку backdrop-filter при загрузке
    checkBackdropFilterSupport();
    
    // ===== ЛОГИРОВАНИЕ (для отладки) =====
    console.log('Сайт ООО "Энергия" успешно загружен');
    console.log('Версия: 1.0');
    console.log('Дата сборки: ' + new Date().toLocaleDateString());
});

// ===== ФУНКЦИЯ ДЛЯ ИНИЦИАЛИЗАЦИИ КНОПКИ СБОРА КОНТАКТОВ =====
function initContactButton() {
    console.log('Попытка инициализации кнопки сбора контактов...');
    
    // Получаем элементы DOM
    const energyContactBtn = document.getElementById('energyContactBtn');
    const energyContactModal = document.getElementById('energyContactModal');
    const energyCloseBtn = document.getElementById('energyCloseBtn');
    const energyCloseModalBtn = document.getElementById('energyCloseModalBtn');
    const energyContactForm = document.getElementById('energyContactForm');
    const energyNotification = document.getElementById('energyNotification');
    
    // Проверяем, существует ли кнопка на странице
    if (!energyContactBtn) {
        console.log('Кнопка сбора контактов не найдена на этой странице');
        return false;
    }
    
    // Проверяем, не инициализирована ли уже кнопка
    if (energyContactBtn.getAttribute('data-initialized') === 'true') {
        console.log('Кнопка уже инициализирована');
        return true;
    }
    
    console.log('Кнопка сбора контактов найдена, инициализируем...');
    
    // Открытие модального окна при клике на кнопку
    energyContactBtn.addEventListener('click', function() {
        console.log('Открытие формы сбора контактов');
        energyContactModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Отключаем прокрутку фона
    });
    
    // Закрытие модального окна
    const closeEnergyModal = () => {
        console.log('Закрытие формы сбора контактов');
        energyContactModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Восстанавливаем прокрутку фона
    };
    
    if (energyCloseBtn) {
        energyCloseBtn.addEventListener('click', closeEnergyModal);
    }
    
    if (energyCloseModalBtn) {
        energyCloseModalBtn.addEventListener('click', closeEnergyModal);
    }
    
    // Закрытие модального окна при клике вне его
    if (energyContactModal) {
        energyContactModal.addEventListener('click', (e) => {
            if (e.target === energyContactModal) {
                closeEnergyModal();
            }
        });
    }
    
    // Обработка отправки формы
    if (energyContactForm) {
        energyContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Получаем данные из формы
            const name = document.getElementById('energyName').value;
            const phone = document.getElementById('energyPhone').value;
            const email = document.getElementById('energyEmail').value;
            
            console.log('ООО "Энергия": отправлены контактные данные');
            console.log('Имя:', name);
            console.log('Телефон:', phone);
            console.log('Email:', email);
            
            // Показываем уведомление об успешной отправке
            if (energyNotification) {
                energyNotification.style.display = 'block';
            }
            
            // Закрываем модальное окно
            closeEnergyModal();
            
            // Сбрасываем форму
            energyContactForm.reset();
            
            // Скрываем уведомление через 3 секунды
            setTimeout(() => {
                if (energyNotification) {
                    energyNotification.style.display = 'none';
                }
            }, 3000);
        });
    }
    
    // Маска для телефона
    const energyPhoneInput = document.getElementById('energyPhone');
    if (energyPhoneInput) {
        energyPhoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length === 0) return;
            
            let formattedValue = '+7 ';
            
            if (value.length > 1) {
                formattedValue += '(' + value.substring(1, 4);
            }
            
            if (value.length >= 5) {
                formattedValue += ') ' + value.substring(4, 7);
            }
            
            if (value.length >= 8) {
                formattedValue += '-' + value.substring(7, 9);
            }
            
            if (value.length >= 10) {
                formattedValue += '-' + value.substring(9, 11);
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Закрытие по клавише Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && energyContactModal && energyContactModal.style.display === 'flex') {
            const closeEnergyModal = () => {
                energyContactModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            };
            closeEnergyModal();
        }
    });
    
    // Помечаем кнопку как инициализированную
    energyContactBtn.setAttribute('data-initialized', 'true');
    console.log('Кнопка сбора контактов успешно инициализирована');
    
    return true;
}