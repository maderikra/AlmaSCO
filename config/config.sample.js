// Define your configuration settings
const appConfig = {
    AlmaAPI: 'https://api-na.hosted.exlibrisgroup.com',
    API_KEY: 'l8xxa5a9633454a04801bf187f86dd55f85e',
    alma_circ_desk: 'DEFAULT_CIRC_DESK',
    alma_library: 'king',
    barcode_format: 'luhn', // luhn or modulo43
    baseUrl: '/',
    inactivityTimeout: 2, // in minutes; maximum inactivity length
    maxSessionLength: 10, // in minutes; maximum session length since last transaction, regardless of activity (do not set too low)
      
};




module.exports = appConfig;
