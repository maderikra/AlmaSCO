const appConfig = require('../config/config'); 
const express = require("express");
const router = express.Router();
const axios = require('axios');
const utils = require('../helpers/utils');




router.post("/checkout", async (req, res) => {
    const barcode = req.body.barcode;
    const user_id = req.session.user_id;
    const postData = {
      circ_desk: { value: appConfig.alma_circ_desk },
      library: { value: appConfig.alma_library },
    };
  
    if (!barcode) {
      return res.status(400).send("Barcode is required");
    }
  
    // Validate barcode
    if (!utils.validateItemBarcode(barcode)) {
      req.session.message = {
        type: "danger",
        text: `<strong>Error: Invalid Barcode</strong><br>Unable to check out item ${barcode}. Please see the circulation desk.`,
      };
      return res.redirect("/");
    }
  
    // API checkout URL
    const loanURL = `${appConfig.AlmaAPI}/almaws/v1/users/${user_id}/loans?item_barcode=${barcode}&apikey=${appConfig.API_KEY}&format=json`;
  
    try {
      // Make the API call with a 10-second timeout
      const response = await axios.post(loanURL, postData, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      });
  
      req.session.isAuthenticated = true;
      const date = new Date(response.data.due_date);
  
      // Store success message in the session
      req.session.message = {
        type: "success",
        text: "has been successfully checked out",
        title: response.data.title,
        barcode: response.data.item_barcode,
        duedate: "Due Date: " + date.toISOString().split("T")[0],
      };
  
      res.redirect("/");
    } catch (error) {
      // Check if error is a timeout error; occasionally the Alma API times out while waiting for a response
      // So send the barcode back, so that on page reload it will verify for the user whether the item was successfully checked out (it usually is) 
      if (error.code === "ECONNABORTED") {
        req.session.message = {
          type: "danger",
          barcode: barcode,
          text: "<strong>Error:</strong> API did not return a response in the alloted time. <br>Please verify below that your item has been checked out.",
        };
      } else if (error.response) {
        const almaError = error.response.data.errorList.error[0].errorMessage;
        console.error("Error from Alma API:", almaError);
        req.session.message = {
          type: "danger",
          text: `<strong>Error: ${almaError}</strong><br>Unable to check out item ${barcode}. Please see the circulation desk.`,
        };
      } else {
        console.error("Unexpected error:", error.message);
        req.session.message = {
          type: "danger",
          text: "<strong>Error:</strong> An unexpected error occurred. Please try again later.",
        };
      }
      res.redirect("/");
    }
  });
  

  module.exports = router;