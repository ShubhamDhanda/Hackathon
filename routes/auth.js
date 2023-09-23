const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require('../middleware/fetchuser');
const { findOne } = require("../models/User");
const axios = require('axios');

const JWT_SECRET = "shubham$sa$";

//  router.get('/s',async (req,res)=>{ 
//   let user = await User.findOne({email: req.body.email});
//   // console.log(user)
//   if(user){
//     return res.status(400).json("sorry a user with this email already exists")
//   }
//   const user1 = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password
//   })
//   const data = {
//     user :{
//       id: user1.id
//     }
//   }
//   var jwtData1 = jwt.sign(data,JWT_SECRET)
//   res.send(user1)
//   console.log(jwtData1)
// })

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("password", "password must be at least 5 digits").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check whether this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //create new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      var authtoken = jwt.sign(data, JWT_SECRET);
      res.json(authtoken);
    } catch (error) {
      console.log(error.message);
            res.status(500).send("Internal server error");
            // res.status(500).send("");
    }
  }
);


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post(
    "/login",
    [
      body("email", "Enter a valid email").isEmail(),
      body("password", "password cannot be blank").exists(),
    ],
    async (req, res) => {
        //if there are errors return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })};
        const {email,password} = req.body;
        try{
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({
                    error:"Please try again with correct credentils"
                })
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare){
                return res.status(400).json({
                    error:"Please try again with correct credentils"
                })
            }
            const data = {
                user: {
                  id: user.id,
                },
              };
              var authtoken = jwt.sign(data, JWT_SECRET);
              res.json({authtoken});
        }catch(error){
            console.log(error.message);
            res.status(500).send("Internal server error");
        }
    })


// ROUTE 3: get logged in User details using: POST "/api/auth/getuser". No login required
router.post(
    "/getuser",fetchuser,async (req, res) => {
        try{
            let userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user);
        }catch(error){
            console.log(error.message);
            res.status(500).send("Internal server error");
        }
    })

const apiKey = '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';

// ROUTE 3: get Chatgpt response
router.post(
  "/getresponse",fetchuser,async (req, res) => {
    try {
      const prompt = 'When someone is feeling lonely and depressed, what are some normal habitual activities they can incorporate into their daily routine to improve their mental well-being? Additionally, are there any instant activities or strategies that can provide immediate relief during moments of distress?. Provide the response in the form of an object with array of  tasks like {taskId: ?, task: ?, regularity: (regularly, every 5 days etc)';
  
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions', // Use the 'chat' endpoint
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides advice.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
  
      const messageContent = response.data.choices[0].message.content;
      
      // You can send the response to the client or do any additional processing here
      res.status(200).json({ response: messageContent });
    } catch (error) {
      console.error('Error generating response:', error.message);
      res.status(500).json({ error: 'An error occurred while generating the response' });
    }
  })
module.exports = router;
