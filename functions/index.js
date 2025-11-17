/* eslint-disable no-undef */

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import twilio from "twilio";

export const sendWhatsapp = onCall(async (request) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      contentSid: "HX350d429d32e64a552466cafecbe95f3c",
      contentVariables: JSON.stringify({
        1: request.data.date,
        2: request.data.time,
      }),
      to: "whatsapp:+918816096346",
    });

    logger.info("WhatsApp message sent:", message.sid);
    return { success: true, sid: message.sid };

  } catch (error) {
    logger.error(error);
    throw new Error(error.message);
  }
});
