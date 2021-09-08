import mongoose from 'mongoose';

// make a new connection if one does not exist already
const connect = handler => async (req, res) => {
    if (mongoose.connections[0].readyState) {
        return handler(req, res);
    }
    await mongoose.connect(process.env.MONGODB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    return handler(req, res);
};

export default connect;
