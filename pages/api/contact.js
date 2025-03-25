import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, phone, offer, message, captcha } = req.body;

    // Controleer of de captcha aanwezig is
    if (!captcha) {
      return res.status(400).json({ message: "Captcha ontbreekt" });
    }

    // Verifieer de captcha met de hCaptcha API
    const verifyUrl = `https://hcaptcha.com/siteverify`;
    const secretKey = process.env.HCAPTCHA_SECRET_KEY;
    
    // Verstuur de validatie-aanvraag naar hCaptcha
    const response = await fetch(verifyUrl, {
      method: "POST",
      body: new URLSearchParams({
        secret: secretKey,
        response: captcha,  // captcha code vanuit frontend
      }),
    });

    const data = await response.json();

    console.log("hCaptcha response:", data); // Debugging van de response

    if (!data.success) {
      return res.status(400).json({ message: "Captcha verificatie mislukt" });
    }

    // Als captcha succesvol is geverifieerd, ga verder met de e-mailverzending
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // false voor STARTTLS, true voor SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Voorkomt issues met certificaten
      }
    });

    // Controleer SMTP-verbinding
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP fout:", error);
  } else {
    console.log("✅ SMTP verbinding succesvol!");
  }
});

    try {
      await transporter.sendMail({
        from: 'offer@makeoffer.nl',
        to: 'offer@makeoffer.nl',
        subject: `Nieuw bod voor ${req.body.domain}`,
        text: `Naam: ${name}\nEmail: ${email}\nTelefoon: ${phone}\nBod: €${offer}\nBericht: ${message}`,
      });
      return res.status(200).json({ message: "Bod succesvol verzonden!" });
    } catch (error) {
      console.error('Error bij verzenden van e-mail:', error);
      return res.status(500).json({ message: "Er is iets misgegaan bij het verzenden van de e-mail." });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

export async function getServerSideProps(context) {
  return {
    props: { domain: context.params.domain || "" },
  };
}