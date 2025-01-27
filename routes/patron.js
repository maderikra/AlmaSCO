const appConfig = require('../config/config'); 
const express = require("express");
const router = express.Router();
const axios = require('axios');

const absoluteMaxAge = 20 * 60 * 1000; // 20 minutes

router.get("/", async (req, res) => {
    let message = req.session.message || null;
    delete req.session.message; // Clear the message after passing it to the template

    if (req.session.authenticated && req.session.user_id) {
        const user_id = req.session.user_id;
        req.session.cookie.maxAge = absoluteMaxAge;
        try {
          // Make the initial API call
          const userresponse = await axios.get(
            `${appConfig.AlmaAPI}/almaws/v1/users/${user_id}?apikey=${appConfig.API_KEY}&expand=loans,requests,fees&format=json`
          );
          const userdata = userresponse.data;
          const response = await axios.get(
            `${appConfig.AlmaAPI}/almaws/v1/users/${user_id}/loans?apikey=${appConfig.API_KEY}&format=json`
          );
          const loandata = response.data;

          // Render the loans template with API data
          res.render("loans", { 
            userdata, 
            loandata, 
            message,
            maxInactivityTimeout: (appConfig.inactivityTimeout * 1000 * 60),
            maxSessionLength: (appConfig.maxSessionLength * 1000 * 60) });
        } catch (error) {
            const almaError = error.response.data.errorList.error[0].errorMessage
         // console.error("Error fetching data:", error.message);
          res.status(500).send("Error fetching data.");
        }
      } else {
        // Render the button choice if the user is not authenticated
        res.render("auth", { message }); 
      }
  });

  router.post("/", async (req, res) => {
  
    //API call
    const API_URL = `${appConfig.AlmaAPI}/almaws/v1/users/${user_id}/loans?apikey=${appConfig.API_KEY}&format=json`;
    try {
      // Make the API call
      const response = await axios.get(API_URL);
      const data = response.data;
      // Render results on the same page
      res.render("loans", { data });
    } catch (error) {
      console.error("Error fetching data from the API:", error.message);
      res.status(500).send("Error fetching data from the API.");
    }
  });


  module.exports = router;