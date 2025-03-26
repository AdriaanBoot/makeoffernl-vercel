import { useState, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import fs from "fs";
import path from "path";
import Link from "next/link";

export default function DomainPage({ domain }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    offer: "",
    message: "",
  });

  const [captchaValue, setCaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCaptchaChange = useCallback((value) => {
    setCaptchaValue(value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      alert("Bevestig dat je geen robot bent.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captcha: captchaValue, domain }),
      });

      if (response.ok) {
        alert("Bod succesvol verzonden!");
        setFormData({ name: "", email: "", phone: "", offer: "", message: "" });
        setCaptchaValue(null);
      } else {
        throw new Error("Er is iets misgegaan. Probeer opnieuw.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!domain) {
    return <p>Domein niet gevonden.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Bied op {domain}</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="text" name="name" placeholder="Naam" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Emailadres" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Telefoonnummer" value={formData.phone} onChange={handleChange} required />
        <input type="number" name="offer" placeholder="Bod in euro's" value={formData.offer} onChange={handleChange} required />
        <textarea name="message" placeholder="Optioneel bericht" value={formData.message} onChange={handleChange} />

        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY} onChange={handleCaptchaChange} />
        <button type="submit" disabled={loading}>{loading ? "Verzenden..." : "Verstuur bod"}</button>
      </form>

      <Link href="/" prefetch={false} style={{ display: "block", marginTop: "20px", textAlign: "center" }}>
        Terug naar home
      </Link>
    </div>
  );
}

// **Optimaliseer getStaticPaths()**
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), "data", "domeinen.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  // Beperk het aantal statisch gegenereerde pagina’s om buildtijd te verkorten
  const paths = allDomains.slice(0, 50).map((domain) => ({
    params: { domain: domain.toLowerCase() },
  }));

  return { paths, fallback: "blocking" };
}

// **Optimaliseer getStaticProps()**
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

  return {
    props: { domain: originalDomain },
    revalidate: 18000, // Revalidate de pagina elke 18000 seconden
  };
}
