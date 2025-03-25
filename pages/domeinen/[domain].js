import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha"; // Gebruik react-google-recaptcha voor Google reCAPTCHA
import fs from "fs";
import path from "path";

export default function DomainPage({ domain }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    offer: "",
    message: "",
  });

  const [captchaValue, setCaptchaValue] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value); // Sla de captcha waarde op
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      alert("Bevestig dat je geen robot bent.");
      return;
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, captcha: captchaValue, domain }),
    });

    if (response.ok) {
      alert("Bod succesvol verzonden!");
      setFormData({ name: "", email: "", phone: "", offer: "", message: "" });
    } else {
      alert("Er is iets misgegaan. Probeer opnieuw.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Bied op {domain}</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          name="name"
          placeholder="Naam"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Emailadres"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefoonnummer"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="offer"
          placeholder="Bod in euro's"
          value={formData.offer}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Optioneel bericht"
          value={formData.message}
          onChange={handleChange}
        ></textarea>

        {/* Google reCAPTCHA widget */}
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY} // Gebruik je Google reCAPTCHA sitekey
          onChange={handleCaptchaChange}
        />

        <button type="submit">Verstuur bod</button>
      </form>
    </div>
  );
}

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), "data", "domeinen.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  const paths = allDomains.map((domain) => ({
    params: { domain: domain.toLowerCase() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { domain } = params;

  if (!domain) {
    return { notFound: true };
  }

  const filePath = path.join(process.cwd(), "data", "domeinen.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  const originalDomain = allDomains.find((d) => d.toLowerCase() === domain.toLowerCase());

  if (!originalDomain) {
    return { notFound: true };
  }

  return { props: { domain: originalDomain } };
}
