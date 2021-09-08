export default function handler(req, res){
   res.json({
       url: process.env.WS_URL
   })
}
