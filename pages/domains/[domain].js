import { useState, useCallback } from "react";
import fs from "fs";
import path from "path";
import ReCAPTCHA from "react-google-recaptcha";

export default function DomainPage({ domain }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    offer: "",
    message: "",
  });

  const [captchaValue, setCaptchaValue] = useState(null);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCaptchaChange = useCallback((value) => {
    setCaptchaValue(value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      alert("Please confirm that you're not a robot.");
      return;
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, captcha: captchaValue, domain }),
    });

    if (response.ok) {
      alert("Your offer has been successfully submitted!");
      setFormData({ name: "", email: "", phone: "", offer: "", message: "" });
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  if (!domain) return <p>Domain not found.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Place your offer for {domain}</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} required />
        <input type="number" name="offer" placeholder="Offer in euros" value={formData.offer} onChange={handleChange} required />
        <textarea name="message" placeholder="Optional message" value={formData.message} onChange={handleChange}></textarea>

        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY} onChange={handleCaptchaChange} />
        <button type="submit">Submit offer</button>
      </form>
    </div>
  );
}

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), "data", "domains_data.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  const paths = allDomains.map(({ domain }) => ({
    params: { domain: domain.toLowerCase() },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { domain } = params;

  const filePath = path.join(process.cwd(), "data", "domains_data.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  const originalDomain = allDomains.find((d) => d.domain.toLowerCase() === domain.toLowerCase());

  if (!originalDomain) return { notFound: true };

  return {
    props: { domain: originalDomain.domain },
    revalidate: 18000, // Revalidate de pagina elke 18000 seconden
  };
}
