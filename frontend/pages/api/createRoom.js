import { nanoid } from 'nanoid';
// import connect from '../../middleware/mongo';

function handler(req, res) {
    // get a code
    let id = nanoid(7);
    // let room = new Room({
    //     code: id
    // })
    // room.save().then(() => {
    res.json({ success: true, href: '/session/' + id });
    // }).catch(() => {
    //     res.json({success: false})
    // });
}

// export default connect(handler);
export default handler;
