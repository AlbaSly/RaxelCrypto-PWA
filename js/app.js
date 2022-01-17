/**
 * Global object
 */
const currencyObj = {
    globalCurrency: '',
    cryptoCurrency: ''
}

function updateObjData(ev) {
    currencyObj[ev.target.name] = ev.target.value;
    console.log(currencyObj);
}

/**
 * HTML Selectors
 */
const globalCurrencies_select = document.querySelector('#globalCurrency');
const cryptoCurrencies_select = document.querySelector('#cryptoCurrency');
const form = document.querySelector('#form');
const result_div = document.querySelector('#result');

/**
 * RUNNING APP
 */
window.onload = () => {
    form.reset();

    loadEventListeners();
    loadSelectorOptions();
};

function loadEventListeners() {
    globalCurrencies_select.addEventListener('change', updateObjData);
    cryptoCurrencies_select.addEventListener('change', updateObjData);

    form.addEventListener('submit', consultConversion);
}

function loadSelectorOptions() {
    new UI().showGlobalCurrencies();
    new UI().showCryptoCurrencies();
}

class UI {
    constructor() {}
    async showGlobalCurrencies() {
        const currencies = await new GlobalCurrenciesAPI().getData(); 
        
        currencies.forEach(currency => {
            const currencyOption = document.createElement('option');

            currencyOption.value = currency[0];
            currencyOption.textContent = `${currency[0]} - ${currency[1]}`;

            globalCurrencies_select.appendChild(currencyOption);
        });
    }
    async showCryptoCurrencies() {
        const currencies = await new CryptoCompareAPI().getData();
        
        currencies.Data.forEach(currency => {
            const {CoinInfo:{Name, FullName}} = currency;

            const currencyOption = document.createElement('option');

            currencyOption.value = Name;
            currencyOption.textContent = `${Name} - ${FullName}`;

            cryptoCurrencies_select.appendChild(currencyOption);
        });
    }
    showAlert(message, timing = 2.5) {
        if (document.querySelector('.error')) document.querySelector('.error').remove();

        const alert_div = document.createElement('div');
        alert_div.classList.add('error');
        alert_div.style.animation = `fade-in-out ${timing}s`;
        alert_div.textContent = message.toUpperCase();

        form.appendChild(alert_div);

        setTimeout(() => {
            alert_div.remove();
        }, timing*1000);
    }
    async showResult(currencyObj) {
        
        const data = await new CryptoCompareAPI().consultInfo(currencyObj);
        
        const {cryptoCurrency, globalCurrency} = currencyObj;
        
        if (data.Response === 'Error') {
            this.showAlert(`${cryptoCurrency}-${globalCurrency} Inexistente en el exchange`);
            return;
        }
        
        this.clearResult();
        
        const currencyInfo = data.DISPLAY[cryptoCurrency][globalCurrency];
        
        const {PRICE, HIGHDAY, LOWDAY, CHANGEPCT24HOUR, LASTUPDATE} = currencyInfo;

        const price_p = document.createElement('p');
        price_p.classList.add('precio');
        price_p.innerHTML = `El Precio es: <span>${PRICE}</span>`;

        const highday_p = document.createElement('p');
        highday_p.innerHTML = `Precio más alto del día: <span>${HIGHDAY}</span>`;

        const lowday_p = document.createElement('p');
        lowday_p.innerHTML = `Precio más bajo del día: <span>${LOWDAY}</span>`;

        const change24hour_p = document.createElement('p');
        change24hour_p.innerHTML = `Variación (24h): ${CHANGEPCT24HOUR}%`;

        const lastUpdate_p = document.createElement('p');
        lastUpdate_p.innerHTML = `Última actualización: ${LASTUPDATE}`;

        result_div.appendChild(price_p);
        result_div.appendChild(highday_p);
        result_div.appendChild(lowday_p);
        result_div.appendChild(change24hour_p);
        result_div.appendChild(lastUpdate_p);
        result_div.style.animation = `fade-in 1s`;
    }
    clearResult() {
        result_div.innerHTML = null;
        result_div.style.animation = '';
    }
    loadSpinner() {
        this.clearResult();

        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        spinner.innerHTML = `
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
        `;

        result_div.appendChild(spinner);

    }
}

class CryptoCompareAPI {
    constructor() {
        this.URL = `https://min-api.cryptocompare.com/data`;
    }
    async getData() {
        const LIMIT = 25;
        const URL = `${this.URL}/top/mktcapfull?limit=${LIMIT}&tsym=USD`;

        try {
            const response = await fetch(URL);
            const data = await response.json();

            return data;
        } catch (error) {
            console.error(error);
        }
    }
    async consultInfo(currencyObj) {
        const {globalCurrency, cryptoCurrency} = currencyObj;
        const URL = `${this.URL}/pricemultifull?fsyms=${cryptoCurrency}&tsyms=${globalCurrency}`;

        try {   
            const response = await fetch(URL);
            const data = await response.json();

            return data;
        } catch (error) {
            console.error(error);
        }
    }
}

class GlobalCurrenciesAPI {
    constructor() {
        this.URL = `https://openexchangerates.org/api/currencies.json`;
    }
    async getData() {
        try {
            const response = await fetch(this.URL);
            const data = await response.json();

            return Object.entries(data);
        } catch (error) {
            console.error(error);
        }
    }
}

function consultConversion(ev) {
    ev.preventDefault();

    if (validate()) {
        new UI().loadSpinner();
        new UI().showResult(currencyObj);
    }
}

function validate() {
    if (Object.values(currencyObj).some(value => value === '' || value === 0)) {
        new UI().showAlert('Ambos campos son obligatorios');
        return false;
    }
    return true;
}