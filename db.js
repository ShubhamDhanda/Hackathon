const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/hackathon?readPreference=primary&appname=MongoDB%20Compass&ssl=false";

const connectToMongo = async () => {
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  };
  
// const connectToMongo = ()=>{
//     mongoose.connect(mongoURI,()=>{
//         console.log('hello');
//     })
// }
module.exports= connectToMongo;