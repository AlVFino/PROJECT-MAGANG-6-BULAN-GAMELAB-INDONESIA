        $(document).ready(function() {
            // Initialize variables
            let map;
            let currentCity = "Jakarta";
            let currentLat = -6.2088;
            let currentLon = 106.8456;
            let isCelsius = true;
            let mapMarker;
            let currentLayer = 'temp';
            
            // Initialize ScrollSpy
            $('body').scrollspy({
                target: '#navbar',
                offset: 80
            });
            
            // Update active nav link on scroll
            $(window).on('activate.bs.scrollspy', function() {
                // Remove active class from all nav links
                $('.nav-link').removeClass('active');
                
                // Add active class to current section
                const activeSection = $('.nav-link[href="' + $('.nav-item.active a').attr('href') + '"]');
                if (activeSection.length) {
                    activeSection.addClass('active');
                }
            });
            
            // Scroll Progress Indicator
            function updateScrollProgress() {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                document.getElementById("scrollProgress").style.width = scrolled + "%";
            }
            
            window.onscroll = function() {
                updateScrollProgress();
                
                // Navbar scroll effect
                if (window.scrollY > 50) {
                    $('.navbar').addClass('scrolled');
                } else {
                    $('.navbar').removeClass('scrolled');
                }
                
                // Show/hide FAB
                if (window.scrollY > 500) {
                    $('#fab').fadeIn(300);
                } else {
                    $('#fab').fadeOut(300);
                }
            };
            
            // FAB click to scroll to top
            $('#fab').click(function() {
                $('html, body').animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
            
            // Show notification
            function showNotification(title, message, type = 'success') {
                $('#notificationTitle').text(title);
                $('#notificationMessage').text(message);
                
                // Set icon based on type
                let icon = 'fa-check-circle';
                let colorClass = 'text-success';
                if (type === 'error') {
                    icon = 'fa-exclamation-circle';
                    colorClass = 'text-danger';
                }
                if (type === 'info') {
                    icon = 'fa-info-circle';
                    colorClass = 'text-info';
                }
                if (type === 'warning') {
                    icon = 'fa-exclamation-triangle';
                    colorClass = 'text-warning';
                }
                
                $('#notification i').attr('class', `fas ${icon} fa-2x ${colorClass}`);
                
                // Set border color
                let borderColor = 'var(--success-color)';
                if (type === 'error') borderColor = 'var(--danger-color)';
                if (type === 'info') borderColor = 'var(--primary-color)';
                if (type === 'warning') borderColor = 'var(--warning-color)';
                
                $('#notification').css('border-left-color', borderColor);
                $('#notification').fadeIn();
                
                // Auto hide after 5 seconds
                setTimeout(hideNotification, 5000);
            }
            
            function hideNotification() {
                $('#notification').fadeOut();
            }
            
            // Initialize map
            function initMap() {
                map = L.map('weatherMap').setView([currentLat, currentLon], 10);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Add click event to map
                map.on('click', function(e) {
                    // Remove previous marker if exists
                    if (mapMarker) {
                        map.removeLayer(mapMarker);
                    }
                    
                    // Add new marker at clicked location
                    mapMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
                        .bindPopup(`<div class="text-center"><strong>Lokasi yang dipilih</strong><br>${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}<br><button class="btn btn-sm btn-primary mt-2" onclick="getWeatherForLocation(${e.latlng.lat}, ${e.latlng.lng})">Dapatkan Cuaca</button></div>`)
                        .openPopup();
                    
                    showNotification('Lokasi Dipilih', 'Klik tombol pada popup untuk mendapatkan cuaca lokasi ini', 'info');
                });
                
                // Add initial marker
                mapMarker = L.marker([currentLat, currentLon]).addTo(map)
                    .bindPopup('Jakarta<br>Suhu: 28°C')
                    .openPopup();
                    
                // Add hover effect to map
                $('#weatherMap').hover(
                    function() {
                        $(this).css('transform', 'translateY(-5px)');
                    },
                    function() {
                        $(this).css('transform', 'translateY(0)');
                    }
                );
            }
            
            // Map controls
            $('#mapZoomIn').click(function() {
                map.zoomIn();
                $(this).css('transform', 'scale(0.9)');
                setTimeout(() => {
                    $(this).css('transform', 'scale(1)');
                }, 200);
                showNotification('Peta', 'Zoom in', 'info');
            });
            
            $('#mapZoomOut').click(function() {
                map.zoomOut();
                $(this).css('transform', 'scale(0.9)');
                setTimeout(() => {
                    $(this).css('transform', 'scale(1)');
                }, 200);
                showNotification('Peta', 'Zoom out', 'info');
            });
            
            $('#mapLocation').click(function() {
                $(this).css('transform', 'rotate(15deg)');
                setTimeout(() => {
                    $(this).css('transform', 'rotate(0)');
                }, 300);
                showNotification('Pilih Lokasi', 'Klik pada peta untuk memilih lokasi yang diinginkan', 'info');
            });
            
            // Map layer buttons
            $('#mapLayerButtons .layer-btn').click(function() {
                // Animation effect
                $(this).css('transform', 'scale(0.95)');
                setTimeout(() => {
                    $(this).css('transform', 'scale(1)');
                }, 200);
                
                // Remove active class from all buttons
                $('#mapLayerButtons .layer-btn').removeClass('active');
                
                // Add active class to clicked button
                $(this).addClass('active');
                
                // Get layer type
                currentLayer = $(this).data('layer');
                
                // Update map visualization based on layer
                updateMapVisualization(currentLayer);
                
                // Show notification
                let layerName = '';
                switch(currentLayer) {
                    case 'temp': layerName = 'Suhu'; break;
                    case 'precipitation': layerName = 'Curah Hujan'; break;
                    case 'wind': layerName = 'Angin'; break;
                    case 'cloud': layerName = 'Tutupan Awan'; break;
                }
                
                showNotification('Layer Diubah', `Menampilkan data ${layerName}`, 'info');
            });
            
            // Update map visualization based on selected layer
            function updateMapVisualization(layer) {
                // In a real app, this would change the map tiles or overlay
                // For demo purposes, we'll just update the marker popup and show a message
                if (mapMarker) {
                    let currentPopup = mapMarker.getPopup();
                    let currentContent = currentPopup.getContent();
                    
                    // Extract location name from popup content
                    let locationName = currentContent.split('<br>')[0];
                    
                    // Update popup based on layer
                    let layerInfo = '';
                    switch(layer) {
                        case 'temp':
                            layerInfo = 'Suhu: 28°C';
                            break;
                        case 'precipitation':
                            layerInfo = 'Curah Hujan: 10%';
                            break;
                        case 'wind':
                            layerInfo = 'Kecepatan Angin: 12 km/jam';
                            break;
                        case 'cloud':
                            layerInfo = 'Tutupan Awan: 25%';
                            break;
                    }
                    
                    mapMarker.bindPopup(`${locationName}<br>${layerInfo}`).openPopup();
                }
            }
            
            // Global function for getting weather from map click
            window.getWeatherForLocation = function(lat, lon) {
                getWeatherByCoords(lat, lon, 'Lokasi Peta');
            };
            
            // Temperature toggle
            $('.temp-toggle-btn').click(function() {
                // Animation effect
                $(this).css('transform', 'scale(0.9)');
                setTimeout(() => {
                    $(this).css('transform', 'scale(1)');
                }, 200);
                
                $('.temp-toggle-btn').removeClass('active');
                $(this).addClass('active');
                
                isCelsius = $(this).data('unit') === 'celsius';
                
                // Update temperature display
                if (currentCity) {
                    updateTemperatureDisplay();
                }
            });
            
            // Update temperature display based on current unit
            function updateTemperatureDisplay() {
                // This function converts all temperature displays
                const tempElements = [
                    { id: '#currentTemp', value: 28 },
                    { id: '#feelsLike', value: 30 },
                    { id: '.hour-item .temp', value: 28 }
                ];
                
                tempElements.forEach(element => {
                    if (element.id === '.hour-item .temp') {
                        // Handle multiple elements
                        $(element.id).each(function() {
                            let currentText = $(this).text();
                            let currentTemp = parseInt(currentText);
                            if (!isNaN(currentTemp)) {
                                let newTemp = isCelsius ? currentTemp : (currentTemp * 9/5) + 32;
                                $(this).text(`${Math.round(newTemp)}°${isCelsius ? 'C' : 'F'}`);
                            }
                        });
                    } else {
                        let currentText = $(element.id).text();
                        let currentTemp = parseInt(currentText);
                        if (!isNaN(currentTemp)) {
                            let newTemp = isCelsius ? currentTemp : (currentTemp * 9/5) + 32;
                            $(element.id).text(`${Math.round(newTemp)}°${isCelsius ? 'C' : 'F'}`);
                        }
                    }
                });
                
                // Update forecast temperatures
                $('.forecast-card .temp').each(function() {
                    let currentText = $(this).text();
                    let currentTemp = parseInt(currentText);
                    if (!isNaN(currentTemp)) {
                        let newTemp = isCelsius ? currentTemp : (currentTemp * 9/5) + 32;
                        $(this).text(`${Math.round(newTemp)}°${isCelsius ? 'C' : 'F'}`);
                    }
                });
                
                // Update highlights
                $('.highlight-value').each(function() {
                    let currentText = $(this).text();
                    let currentTemp = parseInt(currentText);
                    if ($(this).next('.highlight-unit').text().includes('°C')) {
                        if (!isNaN(currentTemp)) {
                            let newTemp = isCelsius ? currentTemp : (currentTemp * 9/5) + 32;
                            $(this).text(Math.round(newTemp));
                            $(this).next('.highlight-unit').text(isCelsius ? '°C' : '°F');
                        }
                    }
                });
                
                showNotification('Satuan Suhu Diubah', `Menggunakan ${isCelsius ? 'Celsius (°C)' : 'Fahrenheit (°F)'}`, 'info');
            }
            
            // Get city coordinates
            async function getCityCoordinates(city) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}, Indonesia&limit=1`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            return {
                                lat: parseFloat(data[0].lat),
                                lon: parseFloat(data[0].lon),
                                display_name: data[0].display_name
                            };
                        }
                    }
                } catch (error) {
                    console.log('Error getting coordinates:', error);
                }
                
                // Default coordinates for major Indonesian cities
                const cityCoords = {
                    "Jakarta": { lat: -6.2088, lon: 106.8456, display_name: "Jakarta, Indonesia" },
                    "Surabaya": { lat: -7.2575, lon: 112.7521, display_name: "Surabaya, Jawa Timur, Indonesia" },
                    "Bandung": { lat: -6.9175, lon: 107.6191, display_name: "Bandung, Jawa Barat, Indonesia" },
                    "Medan": { lat: 3.5952, lon: 98.6722, display_name: "Medan, Sumatera Utara, Indonesia" },
                    "Semarang": { lat: -6.9667, lon: 110.4167, display_name: "Semarang, Jawa Tengah, Indonesia" },
                    "Makassar": { lat: -5.1477, lon: 119.4327, display_name: "Makassar, Sulawesi Selatan, Indonesia" },
                    "Denpasar": { lat: -8.6705, lon: 115.2126, display_name: "Denpasar, Bali, Indonesia" }
                };
                
                return cityCoords[city] || cityCoords["Jakarta"];
            }
            
            // Get weather data by coordinates
            async function getWeatherByCoords(lat, lon, locationName) {
                currentLat = lat;
                currentLon = lon;
                
                // Scroll to weather section
                $('html, body').animate({
                    scrollTop: $('#current-weather').offset().top - 80
                }, 800);
                
                try {
                    // Show loading
                    $('#currentWeatherSpinner').show();
                    $('#currentWeatherContent').hide();
                    
                    // Fetch from Open-Meteo API
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        processWeatherData(data, locationName || `Lokasi (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
                        showNotification('Sukses', 'Data cuaca berhasil diperbarui', 'success');
                    } else {
                        throw new Error('API error');
                    }
                } catch (error) {
                    console.error('Error fetching weather:', error);
                    fallbackToMockData(locationName || 'Lokasi Peta');
                    showNotification('Peringatan', 'Menggunakan data simulasi', 'warning');
                }
            }
            
            // Fetch weather data
            async function getWeatherData(city) {
                // Scroll to weather section
                $('html, body').animate({
                    scrollTop: $('#current-weather').offset().top - 80
                }, 800);
                
                // Show loading
                $('#currentWeatherSpinner').show();
                $('#currentWeatherContent').hide();
                $('#forecastSpinner').show();
                $('#forecastContent').hide();
                
                try {
                    const coordinates = await getCityCoordinates(city);
                    currentLat = coordinates.lat;
                    currentLon = coordinates.lon;
                    
                    // Update map
                    if (mapMarker) {
                        map.removeLayer(mapMarker);
                    }
                    
                    mapMarker = L.marker([currentLat, currentLon]).addTo(map)
                        .bindPopup(`${city}<br>Memuat data cuaca...`)
                        .openPopup();
                    
                    map.setView([currentLat, currentLon], 10);
                    
                    // Update map visualization based on current layer
                    updateMapVisualization(currentLayer);
                    
                    // Fetch weather data
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        processWeatherData(data, coordinates.display_name);
                        showNotification('Sukses', `Data cuaca untuk ${city} berhasil dimuat`, 'success');
                    } else {
                        throw new Error('API error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    fallbackToMockData(city);
                    showNotification('Peringatan', 'Menggunakan data simulasi', 'warning');
                }
            }
            
            // Process weather data
            function processWeatherData(data, locationName) {
                const current = data.current_weather;
                const daily = data.daily;
                
                // Get weather condition
                const weatherInfo = getWeatherConditionFromCode(current.weathercode);
                
                // Update current weather
                updateCurrentWeather(current, daily, weatherInfo, locationName);
                
                // Update forecast
                updateForecast(daily, weatherInfo);
                
                // Update hourly forecast
                updateHourlyForecast();
                
                // Update map marker
                if (mapMarker) {
                    mapMarker.bindPopup(`${locationName.split(',')[0]}<br>Suhu: ${current.temperature}°C<br>${weatherInfo.condition}`).openPopup();
                }
                
                // Update weather tips
                updateWeatherTips(weatherInfo.condition, current.temperature);
                
                // Update today's details
                updateTodayDetails(current, daily);
            }
            
            // Update current weather display
            function updateCurrentWeather(current, daily, weatherInfo, locationName) {
                // Convert temperature if needed
                let temp = current.temperature;
                let tempUnit = 'C';
                
                if (!isCelsius) {
                    temp = (temp * 9/5) + 32;
                    tempUnit = 'F';
                }
                
                // Update UI with animation
                $('#currentCity').hide().text(locationName).fadeIn(500);
                $('#currentTemp').hide().text(`${Math.round(temp)}°${tempUnit}`).fadeIn(500);
                $('#currentCondition').hide().text(weatherInfo.condition).fadeIn(500);
                $('#currentWeatherIcon').attr('class', `fas ${weatherInfo.icon} weather-icon-large`);
                
                // Add animation to icon
                $('#currentWeatherIcon').css('transform', 'rotate(15deg) scale(1.1)');
                setTimeout(() => {
                    $('#currentWeatherIcon').css('transform', 'rotate(0) scale(1)');
                }, 300);
                
                // Feels like (simplified - same as actual temp)
                $('#feelsLike').hide().text(`${Math.round(temp)}°${tempUnit}`).fadeIn(500);
                
                // Other details
                $('#humidity').hide().text(`${Math.floor(Math.random() * 30) + 50}%`).fadeIn(500);
                $('#windSpeed').hide().text(`${current.windspeed} km/jam`).fadeIn(500);
                $('#pressure').hide().text(`${Math.floor(Math.random() * 20) + 1000} hPa`).fadeIn(500);
                
                // Update time
                const now = new Date();
                $('#lastUpdated').text(`Hari ini, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
                
                // Show/hide alert
                if (current.weathercode >= 61 || current.weathercode === 95 || current.weathercode === 96 || current.weathercode === 99) {
                    $('#weatherAlert').slideDown(500);
                    $('#alertText').text(`${weatherInfo.condition} diperkirakan terjadi. Harap waspada dan siapkan perlindungan.`);
                } else {
                    $('#weatherAlert').slideUp(500);
                }
                
                // Hide loading and show content
                $('#currentWeatherSpinner').fadeOut(300, function() {
                    $('#currentWeatherContent').fadeIn(500);
                });
            }
            
            // Update today's details
            function updateTodayDetails(current, daily) {
                // Animate detail cards
                $('.detail-card').each(function(index) {
                    $(this).hide().delay(index * 100).fadeIn(300);
                });
                
                // Update UV Index
                $('#uvIndex').hide().text('5').fadeIn(300);
                
                // Update visibility
                $('#visibility').hide().text(`${Math.floor(Math.random() * 10) + 5} km`).fadeIn(300);
                
                // Update precipitation
                $('#precipitation').hide().text(`${Math.floor(Math.random() * 30)}%`).fadeIn(300);
                
                // Update cloud cover
                $('#cloudCover').hide().text(`${Math.floor(Math.random() * 50)}%`).fadeIn(300);
                
                // Update sunrise and sunset
                if (daily.sunrise && daily.sunrise[0]) {
                    const sunriseTime = new Date(daily.sunrise[0]);
                    $('#sunrise').hide().text(`${sunriseTime.getHours().toString().padStart(2, '0')}:${sunriseTime.getMinutes().toString().padStart(2, '0')}`).fadeIn(300);
                }
                
                if (daily.sunset && daily.sunset[0]) {
                    const sunsetTime = new Date(daily.sunset[0]);
                    $('#sunset').hide().text(`${sunsetTime.getHours().toString().padStart(2, '0')}:${sunsetTime.getMinutes().toString().padStart(2, '0')}`).fadeIn(300);
                }
                
                // Update today's highlights
                if (daily.temperature_2m_max && daily.temperature_2m_max[0]) {
                    let maxTemp = daily.temperature_2m_max[0];
                    let minTemp = daily.temperature_2m_min[0];
                    
                    if (!isCelsius) {
                        maxTemp = (maxTemp * 9/5) + 32;
                        minTemp = (minTemp * 9/5) + 32;
                    }
                    
                    $('.highlight-card:nth-child(1) .highlight-value').html(`${Math.round(maxTemp)}<span class="highlight-unit">${isCelsius ? '°C' : '°F'}</span>`);
                    $('.highlight-card:nth-child(2) .highlight-value').html(`${Math.round(minTemp)}<span class="highlight-unit">${isCelsius ? '°C' : '°F'}</span>`);
                }
            }
            
            // Update hourly forecast
            function updateHourlyForecast() {
                let hourlyHTML = '';
                const now = new Date();
                const currentHour = now.getHours();
                
                for (let i = 0; i < 12; i++) {
                    const hour = (currentHour + i) % 24;
                    const displayHour = hour === 0 ? '12' : hour > 12 ? hour - 12 : hour;
                    const amPm = hour < 12 ? 'AM' : 'PM';
                    const timeLabel = `${displayHour} ${amPm}`;
                    
                    // Generate random temperature for demo
                    let temp = 25 + Math.sin(i/12 * Math.PI) * 5;
                    if (!isCelsius) {
                        temp = (temp * 9/5) + 32;
                    }
                    
                    // Weather icon based on time (simplified)
                    let weatherIcon = 'fa-cloud-sun';
                    if (i > 6) weatherIcon = 'fa-moon';
                    if (i % 3 === 0) weatherIcon = 'fa-cloud-rain';
                    
                    hourlyHTML += `
                    <div class="hour-item">
                        <div class="time">${timeLabel}</div>
                        <div class="weather-icon">
                            <i class="fas ${weatherIcon}"></i>
                        </div>
                        <div class="temp">${Math.round(temp)}°${isCelsius ? 'C' : 'F'}</div>
                    </div>
                    `;
                }
                
                $('#hourlyForecast').html(hourlyHTML);
                
                // Animate hourly items
                $('.hour-item').each(function(index) {
                    $(this).hide().delay(index * 50).fadeIn(300);
                });
            }
            
            // Update forecast display
            function updateForecast(daily, weatherInfo) {
                const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const today = new Date().getDay();
                let forecastHTML = '';
                
                for (let i = 0; i < 7; i++) {
                    const dayIndex = (today + i) % 7;
                    const dayName = i === 0 ? 'Hari Ini' : dayNames[dayIndex];
                    
                    // Get weather for this day
                    const dayWeatherCode = daily.weathercode[i] || 0;
                    const dayWeatherInfo = getWeatherConditionFromCode(dayWeatherCode);
                    
                    // Convert temperature
                    let maxTemp = daily.temperature_2m_max[i] || 28;
                    let minTemp = daily.temperature_2m_min[i] || 23;
                    
                    if (!isCelsius) {
                        maxTemp = (maxTemp * 9/5) + 32;
                        minTemp = (minTemp * 9/5) + 32;
                    }
                    
                    forecastHTML += `
                    <div class="col-lg col-md-4 col-sm-6 mb-3">
                        <div class="forecast-card">
                            <div class="day">${dayName}</div>
                            <div class="weather-icon">
                                <i class="fas ${dayWeatherInfo.icon}"></i>
                            </div>
                            <div class="temp">${Math.round(maxTemp)}°${isCelsius ? 'C' : 'F'}</div>
                            <div class="text-muted">${Math.round(minTemp)}°</div>
                            <div class="condition mt-2">${dayWeatherInfo.condition}</div>
                        </div>
                    </div>
                    `;
                }
                
                $('#forecastContent').html(forecastHTML);
                $('#forecastSpinner').fadeOut(300, function() {
                    $('#forecastContent').fadeIn(500);
                });
                
                // Animate forecast cards
                $('.forecast-card').each(function(index) {
                    $(this).hide().delay(index * 100).fadeIn(300);
                });
            }
            
            // Update weather tips
            function updateWeatherTips(condition, temperature) {
                let tips = '';
                
                if (condition.includes('Hujan') || condition.includes('hujan')) {
                    tips = 'Hari ini diperkirakan hujan. Bawalah payung atau jas hujan. Hindari daerah rawan banjir dan berhati-hati saat berkendara.';
                } else if (condition.includes('Cerah')) {
                    if (temperature > 30) {
                        tips = 'Cuaca cerah dan panas. Gunakan tabir surya, topi, dan kacamata hitam. Minum cukup air untuk menghindari dehidrasi.';
                    } else {
                        tips = 'Cuaca cerah yang sempurna untuk aktivitas outdoor. Waktu yang tepat untuk berjalan-jalan, bersepeda, atau piknik.';
                    }
                } else if (condition.includes('Berawan') || condition.includes('berawan')) {
                    tips = 'Cuaca berawan, cocok untuk aktivitas outdoor tanpa terlalu panas. Tetap bawa persiapan untuk kemungkinan hujan.';
                } else if (condition.includes('Badai') || condition.includes('Petir')) {
                    tips = 'Waspada badai atau petir. Hindari area terbuka, pohon tinggi, dan benda logam. Tetap di dalam ruangan jika memungkinkan.';
                } else {
                    tips = 'Periksa cuaca secara berkala untuk update terbaru. Rencanakan aktivitas dengan memperhatikan kondisi cuaca.';
                }
                
                $('#weatherTips').hide().text(tips).fadeIn(500);
            }
            
            // Get weather condition from code
            function getWeatherConditionFromCode(code) {
                if (code === 0) return { condition: "Cerah", icon: "fa-sun" };
                if (code <= 3) return { condition: "Sebagian Berawan", icon: "fa-cloud-sun" };
                if (code <= 48) return { condition: "Berawan", icon: "fa-cloud" };
                if (code <= 67 || code <= 99) return { condition: "Hujan", icon: "fa-cloud-rain" };
                return { condition: "Berawan", icon: "fa-cloud" };
            }
            
            // Fallback to mock data
            function fallbackToMockData(city) {
                const mockData = {
                    current_weather: {
                        temperature: 28 + Math.floor(Math.random() * 5) - 2,
                        windspeed: 10 + Math.floor(Math.random() * 10),
                        weathercode: Math.floor(Math.random() * 5)
                    },
                    daily: {
                        weathercode: [0, 1, 2, 3, 1, 0, 2],
                        temperature_2m_max: [28, 29, 27, 26, 28, 30, 29],
                        temperature_2m_min: [23, 24, 22, 21, 23, 24, 23],
                        sunrise: ['2023-07-20T05:30', '2023-07-21T05:31', '2023-07-22T05:31', '2023-07-23T05:32', '2023-07-24T05:32', '2023-07-25T05:33', '2023-07-26T05:33'],
                        sunset: ['2023-07-20T17:45', '2023-07-21T17:45', '2023-07-22T17:45', '2023-07-23T17:45', '2023-07-24T17:45', '2023-07-25T17:45', '2023-07-26T17:45']
                    }
                };
                
                // Get coordinates for display name
                getCityCoordinates(city).then(coordinates => {
                    processWeatherData(mockData, coordinates.display_name);
                });
            }
            
            // Initialize map
            setTimeout(initMap, 500);
            
            // Initial load
            getWeatherData(currentCity);
            
            // Search button click
            $('#searchBtn').click(function() {
                // Animation effect
                $(this).css('transform', 'scale(0.95)');
                setTimeout(() => {
                    $(this).css('transform', 'scale(1)');
                }, 200);
                
                const city = $('#cityInput').val().trim();
                if (city) {
                    currentCity = city;
                    getWeatherData(city);
                    $('#cityInput').val('');
                } else {
                    showNotification('Peringatan', 'Silakan masukkan nama kota', 'warning');
                }
            });
            
            // Quick action buttons
            $('button[data-city]').click(function() {
                // Animation effect
                $(this).css('transform', 'scale(0.95)');
                setTimeout(() => {
                    $(this).css('transform', 'scale(1)');
                }, 200);
                
                currentCity = $(this).data('city');
                getWeatherData(currentCity);
            });
            
            // Enter key in search input
            $('#cityInput').keypress(function(e) {
                if (e.which === 13) {
                    $('#searchBtn').click();
                }
            });
            
            // Navbar scroll effect
            $(window).scroll(function() {
                if ($(window).scrollTop() > 50) {
                    $('.navbar').css('padding', '10px 0');
                    $('.navbar').css('background-color', 'rgba(67, 97, 238, 0.98)');
                } else {
                    $('.navbar').css('padding', '15px 0');
                    $('.navbar').css('background-color', 'rgba(67, 97, 238, 0.95)');
                }
            });
            
            // Auto-refresh every 10 minutes
            setInterval(function() {
                if (currentCity) {
                    getWeatherData(currentCity);
                }
            }, 600000);
        });
