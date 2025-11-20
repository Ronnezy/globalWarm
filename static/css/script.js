function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

document.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = 'none';
    }
});

async function calculateFootprint() {
    const carDistance = parseFloat(document.getElementById('car-distance').value) || 0;
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;
    const flights = parseFloat(document.getElementById('flights').value) || 0;
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/calculate-footprint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                car_distance: carDistance,
                electricity: electricity,
                flights: flights
            })
        });
        
        if (!response.ok) throw new Error('Ошибка сети');
        const data = await response.json();
        
        if (data.success) {
            displayResults(data);
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        showError('Ошибка: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const button = document.querySelector('.calculate-btn');
    
    if (show) {
        loading.classList.remove('loading-hidden');
        loading.classList.add('loading-visible');
        button.disabled = true;
        button.textContent = 'Расчет...';
    } else {
        loading.classList.remove('loading-visible');
        loading.classList.add('loading-hidden');
        button.disabled = false;
        button.textContent = 'Рассчитать';
    }
}

function displayResults(data) {
    const resultElement = document.getElementById('result');
    const co2Value = document.getElementById('co2-value');
    const comparison = document.getElementById('comparison');
    const recommendations = document.getElementById('recommendations');
    
    co2Value.textContent = `${data.total_emissions} кг CO₂/месяц`;
    
    const comparisonText = data.average_comparison < 100 
        ? `🎉 Ваш след на ${(100 - data.average_comparison).toFixed(1)}% ниже среднего!`
        : `📊 Ваш след на ${(data.average_comparison - 100).toFixed(1)}% выше среднего`;
    
    comparison.innerHTML = `<div class="comparison-text">${comparisonText}</div>`;
    
    let recommendationHTML = '<div class="recommendations-title">💡 Рекомендации:</div>';
    data.recommendations.forEach(rec => {
        recommendationHTML += `<div class="recommendation-item">${rec}</div>`;
    });
    recommendations.innerHTML = recommendationHTML;
    
    document.getElementById('car-breakdown').textContent = data.breakdown.car;
    document.getElementById('electricity-breakdown').textContent = data.breakdown.electricity;
    document.getElementById('flights-breakdown').textContent = data.breakdown.flights;
    
    resultElement.classList.remove('result-hidden');
    resultElement.classList.add('result-visible');
    
    setTimeout(() => {
        resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 300);
}

function showError(message) {
    const resultElement = document.getElementById('result');
    const co2Value = document.getElementById('co2-value');
    const recommendations = document.getElementById('recommendations');
    
    co2Value.textContent = '❌ Ошибка';
    recommendations.innerHTML = `<div class="error-message">${message}</div>`;
    resultElement.classList.remove('result-hidden');
    resultElement.classList.add('result-visible');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
});