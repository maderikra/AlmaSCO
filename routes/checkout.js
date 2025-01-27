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
    //validate barcode
    if (!utils.validateItemBarcode(barcode)){
        req.session.message = {
            type: "danger",
            text: "<strong>Error: Invalid Barcode</strong><br>Unable to check out item " + barcode + ". Please see the circulation desk.",
          };
          return res.redirect("/");
    }
    //API checkout URL
    const loanURL = `${appConfig.AlmaAPI}/almaws/v1/users/${user_id}/loans?item_barcode=${barcode}&apikey=${appConfig.API_KEY}&format=json`;
    try {
      // Make the API call
      const response = await axios.post(loanURL, postData, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

        req.session.isAuthenticated = true;

        const date = new Date(response.data.due_date);
        // Store success message in the session
        req.session.message = {
        type: "success",
        text: "has been successfully checked out",
        title: response.data.title,
        barcode: response.data.item_barcode,
        duedate: "Due Date: " + date.toISOString().split("T")[0]
      };

      // Render results on the same page
      res.redirect("/");
    } catch (error) {
        const almaError = error.response.data.errorList.error[0].errorMessage
        console.log(almaError)
      console.error("Error fetching data from the API:", error.message);
      if (error.response) {
        req.session.message = {
            type: "danger",
            text: "<strong>Error: " + almaError + "</strong><br>Unable to check out item " + barcode + ". Please see the circulation desk.",
          };
      }
      res.redirect("/");
    }
  });


  module.exports = router;