import { client } from "../..";
import dayjs from "dayjs"

client.once('ready', () => {
    console.log('OOTP-SimBot has logged in as: ' + client.user?.tag + 'at ' + dayjs(Date.now()).format('dddd, MMMM D, YYYY hh:mm:ss a'));
})