import { useState, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import fs from "fs";
import path from "path";
import Link from "next/link";

export default function DomainPage({ domainData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    offer: "",
    message: "",
  });

  const [captchaValue, setCaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState(false); // State voor de bedanktmelding

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
        body: JSON.stringify({ ...formData, captcha: captchaValue, domain: domainData.domain }),
      });

      if (response.ok) {
        setThankYouMessage(true); // Toon de bedanktmelding
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

  if (!domainData) {
    return <p>Domein niet gevonden.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>Bied op {domainData.domain}</h1>
      <p style={{ fontSize: "16px", marginBottom: "20px", color: "#555" }}>{domainData.description}</p>
      
      {/* Vraagprijs boven het formulier */}
      <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "20px" }}>
        Vraagprijs: €{domainData.price} ex. BTW
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="text" 
          name="name" 
          placeholder="Naam" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          style={{ padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "4px" }} 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Emailadres" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={{ padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "4px" }} 
        />
        <input 
          type="tel" 
          name="phone" 
          placeholder="Telefoonnummer" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
          style={{ padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "4px" }} 
        />
        <input 
          type="number" 
          name="offer" 
          placeholder="Bod in euro's" 
          value={formData.offer} 
          onChange={handleChange} 
          required 
          style={{ padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "4px" }} 
        />
        <textarea 
          name="message" 
          placeholder="Optioneel bericht" 
          value={formData.message} 
          onChange={handleChange} 
          style={{ padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "100px" }} 
        />

        <ReCAPTCHA 
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY} 
          onChange={handleCaptchaChange} 
        />
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{
            padding: "15px", 
            fontSize: "18px", 
            backgroundColor: "#4CAF50", 
            color: "#fff", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer", 
            transition: "background-color 0.3s"
          }}
        >
          {loading ? "Verzenden..." : "Verstuur bod"}
        </button>
      </form>

      {/* USP's onder het formulier */}
      <div style={{ marginTop: "30px", fontSize: "16px", color: "#333", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "#4CAF50", marginRight: "8px" }}>✔</span>
          <span>Doe een vrijblijvend bod op jouw nieuwe domeinnaam</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "#4CAF50", marginRight: "8px" }}>✔</span>
          <span>Ontvang binnen 24 uur een reactie</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "#4CAF50", marginRight: "8px" }}>✔</span>
          <span>Betrouwbare ondersteuning bij de aankoop</span>
        </div>
      </div>

      {/* Bedanktmelding in grijs en onder de verzendknop */}
      {thankYouMessage && (
        <div style={{
          padding: "15px",
          backgroundColor: "#E0E0E0", // Grijze kleur
          color: "#333", // Donkere tekstkleur
          borderRadius: "4px",
          marginTop: "20px",
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "bold"
        }}>
          Bedankt voor je bod! We nemen zo snel mogelijk contact met je op.
        </div>
      )}

      <Link href="/" prefetch={false} style={{ display: "block", marginTop: "20px", textAlign: "center", textDecoration: "underline", color: "#333" }}>
        Terug naar home
      </Link>
    </div>
  );
}

// **Dynamic Path Generation**
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), "data", "domeinen.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  const paths = allDomains.map((domain) => ({
    params: { domain: domain.domain.toLowerCase() },
  }));

  return { paths, fallback: "blocking" };
}

// **Static Props with JSON**
export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), "data", "domeinen.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  const domainData = allDomains.find(
    (d) => d.domain.toLowerCase() === params.domain.toLowerCase()
  );

  if (!domainData) {
    return { notFound: true };
  }

  return {
    props: { domainData },
    revalidate: 18000,
  };
}
