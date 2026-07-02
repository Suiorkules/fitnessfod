// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ==========================================
let totalCalories = parseInt(localStorage.getItem('calories')) || 0;
let totalP = parseFloat(localStorage.getItem('p')) || 0;
let totalF = parseFloat(localStorage.getItem('f')) || 0;
let totalC = parseFloat(localStorage.getItem('c')) || 0;
let totalWater = parseInt(localStorage.getItem('water')) || 0;
let targetCalories = parseInt(localStorage.getItem('targetCalories')) || 0;

// Массив съеденного ЗА СЕГОДНЯ и архив ИСТОРИИ по дням
let todayFoods = JSON.parse(localStorage.getItem('todayFoods')) || [];
let historyData = JSON.parse(localStorage.getItem('fitHistory')) || [];

if (document.getElementById('water-count')) {
    document.getElementById('water-count').innerText = totalWater;
}

// ==========================================
// 2. ФУНКЦИИ ИНТЕРФЕЙСА (Отрисовка)
// ==========================================

// Отрисовка списка продуктов, съеденных СЕГОДНЯ
function renderTodayFoods() {
    const todayList = document.getElementById('today-food-list');
    if (!todayList) return;

    if (todayFoods.length === 0) {
        todayList.innerHTML = '<p style="color: var(--text-muted); font-style: italic; font-size: 0.9rem;">Вы пока ничего не добавили за сегодня.</p>';
        return;
    }

    todayList.innerHTML = '';
    todayFoods.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; margin: 5px 0; font-size: 0.95rem; display: flex; justify-content: space-between;";
        div.innerHTML = `
            <span>🔹 <b>${item.name}</b> (${item.weight}г)</span>
            <span style="color: var(--neon-green)">+${item.cal} ккал</span>
        `;
        todayList.appendChild(div);
    });
}

// Отрисовка ГЛОБАЛЬНОЙ ИСТОРИИ (Архив прошлых дней)
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (historyData.length === 0) {
        historyList.innerHTML = '<p class="empty-history">История пока пуста. Начни новый день, чтобы сохранить первые данные!</p>';
        return;
    }

    historyList.innerHTML = '';
    historyData.slice().reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        // Формируем строчку со списком съеденного в этот день для архива
        let foodDetails = "";
        if (item.foods && item.foods.length > 0) {
            foodDetails = `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.1)">
                ${item.foods.map(f => `${f.name} (${f.weight}г)`).join(', ')}
            </div>`;
        }

        div.innerHTML = `
            <div style="width: 100%;">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <span>📅 <b>${item.date}</b></span>
                    <span>🔥 ${item.calories} / ${item.target} ккал</span>
                    <span>💧 Вода: ${item.water} мл</span>
                </div>
                ${foodDetails}
            </div>
        `;
        historyList.appendChild(div);
    });
}

// Обновление главных шкал и статов Системы
function updateUI() {
    if (document.getElementById('total-calories')) document.getElementById('total-calories').innerText = totalCalories;
    if (document.getElementById('total-p')) document.getElementById('total-p').innerText = totalP.toFixed(1);
    if (document.getElementById('total-f')) document.getElementById('total-f').innerText = totalF.toFixed(1);
    if (document.getElementById('total-c')) document.getElementById('total-c').innerText = totalC.toFixed(1);
    
    const progressBar = document.getElementById('calorie-progress-bar');

    if (targetCalories > 0) {
        if (document.getElementById('target-calories-display')) document.getElementById('target-calories-display').innerText = targetCalories;
        if (document.getElementById('target-p')) document.getElementById('target-p').innerText = Math.round((targetCalories * 0.3) / 4);
        if (document.getElementById('target-f')) document.getElementById('target-f').innerText = Math.round((targetCalories * 0.3) / 9);
        if (document.getElementById('target-c')) document.getElementById('target-c').innerText = Math.round((targetCalories * 0.4) / 4);

        if (progressBar) {
            let percentage = (totalCalories / targetCalories) * 100;
            if (percentage > 100) {
                progressBar.style.width = '100%';
                progressBar.classList.add('overlimit');
            } else {
                progressBar.style.width = percentage + '%';
                progressBar.classList.remove('overlimit');
            }
        }
    } else {
        if (progressBar) progressBar.style.width = '0%';
    }

    renderTodayFoods();
    renderHistory();
}

// ==========================================
// 3. ОБРАБОТЧИКИ СОБЫТИЙ (Квесты Системы)
// ==========================================

// Расчет личной нормы
const calcBtn = document.getElementById('calc-profile-btn');
if (calcBtn) {
    calcBtn.addEventListener('click', () => {
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);
        const height = parseInt(document.getElementById('height').value);
        const weight = parseInt(document.getElementById('weight').value);
        const activity = parseFloat(document.getElementById('activity').value);

        if (!age || !height || !weight) {
            alert('Заполните, пожалуйста, все поля: возраст, рост и вес!');
            return;
        }

        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        let bmiStatus = '';
        if (bmi < 18.5) bmiStatus = 'Дефицит веса';
        else if (bmi >= 18.5 && bmi < 25) bmiStatus = 'Нормальный вес';
        else if (bmi >= 25 && bmi < 30) bmiStatus = 'Избыточный вес';
        else bmiStatus = 'Ожирение';

        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') bmr += 5; else bmr -= 161;

        const finalCalories = Math.round(bmr * activity);
        const lossCalories = Math.round(finalCalories * 0.85);

        targetCalories = lossCalories;
        localStorage.setItem('targetCalories', targetCalories);

        document.getElementById('bmi-val').innerText = bmi;
        document.getElementById('bmi-status').innerText = bmiStatus;
        document.getElementById('bmr-val').innerText = finalCalories;
        document.getElementById('loss-val').innerText = lossCalories;

        document.getElementById('profile-results').classList.remove('hidden');
        updateUI();
    });
}

// Добавление кастомного продукта
const addCustomBtn = document.getElementById('add-custom-product-btn');
if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
        const name = document.getElementById('custom-name').value.trim();
        const cal = parseFloat(document.getElementById('custom-cal').value);

        if (name && cal >= 0) {
            const select = document.getElementById('product-select');
            const newOption = document.createElement('option');
            newOption.value = name.toLowerCase();
            newOption.innerText = `${name} (${cal} ккал/100г)`;
            newOption.setAttribute('data-cal', cal);
            newOption.setAttribute('data-p', (cal * 0.05).toFixed(1)); 
            newOption.setAttribute('data-f', (cal * 0.03).toFixed(1));
            newOption.setAttribute('data-c', (cal * 0.12).toFixed(1));
            
            select.appendChild(newOption);
            select.value = newOption.value;
            
            document.getElementById('custom-name').value = '';
            document.getElementById('custom-cal').value = '';
        } else {
            alert('Введите название продукта и его калорийность!');
        }
    });
}

// Добавление еды и расчет под введенный вес
const addFoodBtn = document.getElementById('add-food-btn');
if (addFoodBtn) {
    addFoodBtn.addEventListener('click', () => {
        const select = document.getElementById('product-select');
        const weightInput = document.getElementById('product-weight');
        const selectedOption = select.options[select.selectedIndex];
        
        const weight = parseFloat(weightInput.value);
        if (select.value !== 'default' && weight > 0) {
            const calPer100 = parseFloat(selectedOption.getAttribute('data-cal'));
            const pPer100 = parseFloat(selectedOption.getAttribute('data-p')) || 0;
            const fPer100 = parseFloat(selectedOption.getAttribute('data-f')) || 0;
            const cPer100 = parseFloat(selectedOption.getAttribute('data-c')) || 0;

            // Считаем точные значения под введенные граммы
            const calculatedCal = Math.round((calPer100 / 100) * weight);
            const calculatedP = (pPer100 / 100) * weight;
            const calculatedF = (fPer100 / 100) * weight;
            const calculatedC = (cPer100 / 100) * weight;

            // Накапливаем общую сумму
            totalCalories += calculatedCal;
            totalP += calculatedP;
            totalF += calculatedF;
            totalC += calculatedC;

            // Добавляем этот конкретный продукт в наш список за сегодня
            todayFoods.push({
                name: selectedOption.text.split(' (')[0], // Берем чистое название продукта
                weight: weight,
                cal: calculatedCal
            });

            // Сохраняем всё в LocalStorage
            localStorage.setItem('calories', totalCalories);
            localStorage.setItem('p', totalP); 
            localStorage.setItem('f', totalF); 
            localStorage.setItem('c', totalC);
            localStorage.setItem('todayFoods', JSON.stringify(todayFoods));

            updateUI();
            weightInput.value = '';
        } else {
            alert('Выберите продукт и укажите его вес в граммах!');
        }
    });
}

// Вода
if(document.getElementById('add-water-btn')) {
    document.getElementById('add-water-btn').addEventListener('click', () => {
        totalWater += 250;
        localStorage.setItem('water', totalWater);
        document.getElementById('water-count').innerText = totalWater;
    });
}
if(document.getElementById('reset-water-btn')) {
    document.getElementById('reset-water-btn').addEventListener('click', () => {
        totalWater = 0;
        localStorage.setItem('water', totalWater);
        document.getElementById('water-count').innerText = totalWater;
    });
}

// Кнопка завершения дня (Архивация)
const resetDayBtn = document.getElementById('reset-day-btn');
if (resetDayBtn) {
    resetDayBtn.addEventListener('click', () => {
        if(confirm("Завершить текущий день и заархивировать данные в историю?")) {
            const today = new Date();
            const dateString = today.toLocaleDateString('ru-RU');

            // Записываем день, включая массив съеденных продуктов
            const currentDayRecord = {
                date: dateString,
                calories: totalCalories,
                target: targetCalories,
                water: totalWater,
                foods: todayFoods
            };

            historyData.push(currentDayRecord);
            localStorage.setItem('fitHistory', JSON.stringify(historyData));

            // ПОЛНЫЙ СБРОС ТЕКУЩЕГО ДНЯ
            totalCalories = 0; totalP = 0; totalF = 0; totalC = 0; totalWater = 0;
            todayFoods = [];
            
            localStorage.setItem('calories', 0);
            localStorage.setItem('p', 0); localStorage.setItem('f', 0); localStorage.setItem('c', 0);
            localStorage.setItem('water', 0);
            localStorage.setItem('todayFoods', JSON.stringify([]));
            
            if(document.getElementById('water-count')) document.getElementById('water-count').innerText = 0;

            updateUI();
        }
    });
}

// Полная очистка архива
const clearHistoryBtn = document.getElementById('clear-history-btn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if(confirm("Вы уверены, что хотите полностью удалить ВСЮ историю прогресса?")) {
            historyData = [];
            localStorage.removeItem('fitHistory');
            renderHistory();
        }
    });
}

// Запуск при старте
updateUI();
