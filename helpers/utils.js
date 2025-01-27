const appConfig = require('../config/config'); 

//for validating item barcodes
const luhn = require("luhn");


function validateItemBarcode(barcode){
  if (appConfig.barcode_format == 'luhn'){
    return luhn.validate(barcode);
  }
  else if (appConfig.barcode_format == 'modulo43'){
    return validateModulo43(barcode);
  }
}

  function validateModulo43(barcode) {
    // List of characters in the Code 39 barcode specification
    const code39chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%";
  
    // Ensure barcode length is correct
    if (barcode.length <= 1) {
      return false;
    }
  
    // Get the potential checksum character from the barcode
    const checksumChar = barcode.charAt(barcode.length - 1);
    
    // Calculate the checksum of the barcode data (exclude the last character)
    let checksumTotal = 0;
    for (let i = 0; i < barcode.length - 1; i++) {
      const character = barcode.charAt(i).toUpperCase();
      const characterValue = code39chars.indexOf(character);
      if (characterValue === -1) {
        // Invalid character found
        return false;
      }
      checksumTotal += characterValue;
    }
  
    // Calculate the checksum digit
    const calculatedChecksumValue = checksumTotal % 43;
    const calculatedChecksumChar = code39chars.charAt(calculatedChecksumValue);
  
    // Verify the provided checksum character against the calculated checksum
    return checksumChar.toUpperCase() === calculatedChecksumChar;
  }
  
  function validatePatronBarcode(str) {
    // make sure it only has numbers; consider adding further validation (do all have 9 digits?)
    return /^[0-9]+$/.test(str);
  }



module.exports = {
    validateItemBarcode,
    validatePatronBarcode
};