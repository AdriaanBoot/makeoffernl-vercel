import fs from "fs";
import path from "path";
import Link from "next/link";

export default function HomePage({ featuredNL, featuredEN }) {
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Welcome to MakeOffer</h1>
      <p style={{ textAlign: "center" }}>Place a bid on premium domain names.</p>
      
      <section>
        <h2>Top 10 Featured Dutch Domains</h2>
        <ul>
          {featuredNL.map((domain) => (
            <li key={domain.domain}>
              <Link href={`/domeinen/${domain.domain}`}>{domain.domain}</Link> - asking price: €{domain.price} ex. VAT
            </li>
          ))}
        </ul>
        <Link href="/domeinen">View all Dutch domains →</Link>
      </section>

      <section>
        <h2>Top 10 Featured English Domains</h2>
        <ul>
          {featuredEN.map((domain) => (
            <li key={domain.domain}>
              <Link href={`/domains/${domain.domain}`}>{domain.domain}</Link> - asking price: €{domain.price} ex. VAT
            </li>
          ))}
        </ul>
        <Link href="/domains">View all English domains →</Link>
      </section>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const nlFilePath = path.join(process.cwd(), "data", "domeinen.json");
    const enFilePath = path.join(process.cwd(), "data", "domains_data.json");

    const nlData = JSON.parse(fs.readFileSync(nlFilePath, "utf8"));
    const enData = JSON.parse(fs.readFileSync(enFilePath, "utf8"));

    // Correcte definitie van allDomains
    const allDomains = [...nlData, ...enData];

    const featuredNL = allDomains
      .filter(d => d.language === "nl" && d.featured === true)
      .slice(0, 10);

    const featuredEN = allDomains
      .filter(d => d.language === "en" && d.featured === true)
      .slice(0, 10);

    return {
      props: { featuredNL, featuredEN },
      revalidate: 18000,
    };
  } catch (error) {
    console.error("Error loading domain data:", error);
    return { props: { featuredNL: [], featuredEN: [] } };
  }
}
