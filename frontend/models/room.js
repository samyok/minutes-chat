import mongoose, {model, Schema} from 'mongoose';

let room = new Schema({
    code: {
        type: String,
        required: true,
    },
    participants: [Schema.Types.Mixed]
})

const Room = mongoose.models.Room || model('Room', room);

export default Room;
