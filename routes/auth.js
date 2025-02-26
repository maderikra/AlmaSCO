const appConfig = require('../config/config'); 
const express = require("express");
const router = express.Router();
const axios = require('axios');
const utils = require('../helpers/utils');
const xmlformatter = require("xml-formatter");


router.post("/auth", async (req, res) => {
    //Alma user lookup API 
    const userBarcode = req.body.barcode; 
    //validate barcode
    if (!utils.validatePatronBarcode(userBarcode)){
        req.session.message = {
            type: "danger",
            text: "<strong>Error: Invalid Barcode</strong><br>Please see the circulation desk.",
            };
            return res.redirect("/");
    }
    try {
        // Make the initial API call
        const response = await axios.get(
          `${appConfig.AlmaAPI}/almaws/v1/users?limit=10&offset=0&q=identifiers~${userBarcode}&order_by=last_name%2C%20first_name%2C%20primary_id&expand=none&apikey=${appConfig.API_KEY}&format=json`
        );
        //check number of results; if more than one result, return an error
        if (response.data.total_record_count === 1) {
            req.session.authenticated = true;
            req.session.user_id = response.data.user[0].primary_id;
            res.redirect("/");
        }
        else{
            req.session.message = {
                type: "danger",
                text: "<strong>Error: No User Found </strong><br> Please see the circulation desk.",
              };
              return res.redirect("/");
        }
      } catch (error) {
         console.log(error)
         const almaError = error.response.data
         const formattedXml = xmlformatter(almaError, { indentation: "  ", collapseContent: true });
         console.error("Error fetching data:", error);
         return res.render("error", { almaError: formattedXml });

      }

    
    // Save the user authentication state in the session
   // req.session.authenticated = true;
  
    // Redirect to `/` to continue the flow
   // res.redirect("/");
  });

  module.exports = router;