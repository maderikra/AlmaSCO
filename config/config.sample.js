// Define your configuration settings
const appConfig = {
    AlmaAPI: '',
    API_KEY: '',
    alma_circ_desk: '',
    alma_library: '',
    validate_barcodes: true, //true or false
    barcode_prefix: '',
    barcode_format: '', // luhn or modulo43
    baseUrl: '/',
    inactivityTimeout: 2, // in minutes; maximum inactivity length
    maxSessionLength: 10, // in minutes; maximum session length since last transaction, regardless of activity (do not set too low)
      
};




module.exports = appConfig;
