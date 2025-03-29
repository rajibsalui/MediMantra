import mongoose from "mongoose"

const connectDb=async()=>{

    try {
        const connectionInstance=await mongoose.connect(`${process.env.DB_URL}${process.env.DB_NAME}?retryWrites=true&w=majority`);
    
        console.log("mongodb connection is successfull",connectionInstance.connection.host);
    } catch (error) {
         console.log("DB connection failed"+error);
         process.exit(1);
         
    }
}

export default connectDb;