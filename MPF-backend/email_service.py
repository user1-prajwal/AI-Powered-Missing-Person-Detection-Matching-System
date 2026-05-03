
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text      import MIMEText
from email.mime.image     import MIMEImage
import os
from dotenv import load_dotenv
load_dotenv()
emaill=os.getenv("EMAIL")
e_p=os.getenv("EMAIL_PASSWORD")

SENDER_EMAIL    = emaill   # ← change this
SENDER_PASSWORD = e_p  # ← change this  

def send_match_alert(family_email, person_name, confidence, latitude, longitude, sighting_image_path=None):
    try:
        maps_link = f"https://www.google.com/maps?q={latitude},{longitude}"

        html = f"""
        <html>
        <body style="margin:0; padding:0; background-color:#f0f2f5; font-family: Arial, sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

                  <!-- HEADER -->
                  <tr>
                    <td style="background-color:#1a1a2e; padding:24px; text-align:center;">
                      <h1 style="color:white; margin:0; font-size:22px;">🔍 Missing Person Finder</h1>
                    </td>
                  </tr>

                  <!-- ALERT BANNER -->
                  <tr>
                    <td style="background-color:#ff4d4f; padding:16px; text-align:center;">
                      <h2 style="color:white; margin:0; font-size:20px;">🚨 POSSIBLE MATCH FOUND</h2>
                    </td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="padding:30px;">

                      <p style="font-size:16px; color:#333; margin-top:0;">
                        Good news! Our system found a possible match for <strong>{person_name}</strong>.
                      </p>

                      <!-- DETAILS TABLE -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:24px;">
                        <tr style="background-color:#e6f7ff;">
                          <td style="padding:12px 16px; border:1px solid #d0d0d0; font-weight:bold; width:40%; color:#333;">Person</td>
                          <td style="padding:12px 16px; border:1px solid #d0d0d0; color:#333;">{person_name}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px; border:1px solid #d0d0d0; font-weight:bold; color:#333;">Match Confidence</td>
                          <td style="padding:12px 16px; border:1px solid #d0d0d0; color:#52c41a; font-weight:bold;">{confidence}%</td>
                        </tr>
                        <tr style="background-color:#e6f7ff;">
                          <td style="padding:12px 16px; border:1px solid #d0d0d0; font-weight:bold; color:#333;">Location</td>
                          <td style="padding:12px 16px; border:1px solid #d0d0d0; color:#333;">{latitude}, {longitude}</td>
                        </tr>
                      </table>

                      <!-- SIGHTING IMAGE -->
                      {"" if not sighting_image_path else '''
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                        <tr>
                          <td style="background-color:#f9f9f9; border:1px solid #eee; border-radius:8px; padding:16px; text-align:center;">
                            <p style="margin:0 0 12px 0; font-weight:bold; color:#333; font-size:15px;">
                              📸 Photo uploaded by public
                            </p>
                            <img src="cid:sighting_image"
                                 alt="Sighting Photo"
                                 style="max-width:100%;
                                        max-height:300px;
                                        border-radius:8px;
                                        border:2px solid #1a1a2e;" />
                            <p style="margin:10px 0 0 0; font-size:12px; color:#888;">
                              Please verify if this matches your missing family member
                            </p>
                          </td>
                        </tr>
                      </table>
                      '''}

                      <!-- MAP BUTTON -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:10px 0 24px 0;">
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="background-color:#1a1a2e; border-radius:8px;">
                                  <a href="{maps_link}"
                                     target="_blank"
                                     style="display:inline-block;
                                            padding:14px 32px;
                                            color:#ffffff;
                                            font-size:15px;
                                            font-weight:bold;
                                            text-decoration:none;
                                            border-radius:8px;
                                            font-family:Arial, sans-serif;">
                                    📍 View Location on Google Maps
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- WARNING -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background-color:#fff3cd;
                                     border-left:4px solid #ffc107;
                                     border-radius:6px;
                                     padding:16px;">
                            <p style="margin:0; color:#555; font-size:14px;">
                              <strong>⚠️ Important:</strong> This is an AI-based match.
                              Please verify in person and contact your local
                              police station immediately.
                            </p>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background-color:#1a1a2e; padding:16px; text-align:center;">
                      <p style="color:#aaaaaa; margin:0; font-size:13px;">
                        Missing Person Finder System — Automated Alert
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
        """

        # ── Build email ───────────────────────────────────────
        msg                 = MIMEMultipart("related")
        msg["Subject"]      = f"🚨 ALERT: Possible match found for {person_name}"
        msg["From"]         = f"Missing Person Finder <{SENDER_EMAIL}>"
        msg["To"]           = family_email
        msg["Reply-To"]     = SENDER_EMAIL
        msg["X-Priority"]   = "1"

        # Attach HTML
        msg.attach(MIMEText(html, "html"))

        # Attach sighting image if provided
        if sighting_image_path and os.path.exists(sighting_image_path):
            with open(sighting_image_path, "rb") as img_file:
                img             = MIMEImage(img_file.read())
                img["Content-ID"] = "<sighting_image>"   # matches cid: in html
                img.add_header(
                    "Content-Disposition",
                    "inline",
                    filename = os.path.basename(sighting_image_path)
                )
                msg.attach(img)

        # ── Send ──────────────────────────────────────────────
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)

        print(f"✅ Email sent to {family_email}")
        return True

    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False