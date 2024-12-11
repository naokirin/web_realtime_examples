import fs from "fs";
import { Http3Server } from "@fails-components/webtransport";

const PORT = 4433;
const HOST = "0.0.0.0";

async function main() {
  const certificate = {
    private: fs.readFileSync("./certificate.key"),
    cert: fs.readFileSync("./certificate.pem"),
    fingerprint: "" // not used in production

  };

  const h3Server = new Http3Server({
    host: HOST,
    port: PORT,
    secret: "mysecret",
    cert: certificate?.cert,
    privKey: certificate?.private,
  });

  h3Server.startServer();

  let killed = false;

  const handle = (e) => {
    killed = true;
    h3Server.stopServer();
  }

  process.on("SIGINT", handle);
  process.on("SIGTERM", handle);

  try {
    const sessionStream = await h3Server.sessionStream("/webtransport");
    const sessionReader = sessionStream.getReader();
    sessionReader.closed.catch((e) => console.log(`Session reader closed with error: ${e}`));

    while (!killed) {
      console.log("Waiting for session...");
      const { done, value } = await sessionReader.read();
      if (done) {
        console.log("done! break loop.");
        break;
      }

      value.closed.then(() => {
        console.log("Session closed");
      }).catch((e) => {
        console.log(`Session closed with error: ${e}`);
      });

      value.ready.then(() => {
        console.log("Ready to create bidirectional stream");

        value.createBidirectionalStream().then((stream) => {
          const writer = stream.writable.getWriter();

          count = 0;
          const sendingInterval = setInterval(() => {
            count += 1;
            console.log("sending...");
            const message = new TextEncoder('utf-8').encode(`Hello, ${count}`);
            console.log(message);
            writer.write(message);
          }, 3000);

          writer.closed.catch((e) => {
            console.log(`Writer closed with error: ${e}`);
            clearInterval(sendingInterval);
          });

        }).catch((e) => {
          console.log(`Error: ${e}`);
        });

      }).catch((e) => {
        console.log(`Error: ${e}`);
      });
    }

  } catch (e) {
    console.error(`Error: ${e}`);
  }
}

main();