import 'dotenv/config';
import https from 'https';
import {app} from "./src/express";

const PORT = Number(process.env.PORT) | 3000;

//Session Options stuff can come here and is then passed with app as 'createServer(sessionOptions, app)'

const httpsServer = https.createServer(app);
httpsServer.listen(PORT, () => console.log(`Listening on Port: ${PORT}`))