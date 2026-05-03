import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // Wait 15 seconds for server selection
      connectTimeoutMS: 30000,         // Wait 30 seconds for initial connection
      socketTimeoutMS: 45000,          // Wait 45 seconds for socket activity
    })
    console.log('MongoDB Connected successfully')
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message)
    if (error.name === 'MongooseServerSelectionError') {
      console.error('TIP: Check if your IP is whitelisted in MongoDB Atlas (Network Access).')
    }
    process.exit(1)
  }
}

export default connectDB