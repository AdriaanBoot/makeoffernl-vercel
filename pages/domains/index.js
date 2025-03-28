import fs from "fs";
import path from "path";
import Link from "next/link";

export default function DomainsPage({ domains }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Available Domains for Sale</h1>
      <p>Browse the list of available domains and place your offer.</p>
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {domains.map((domain) => (
          <li key={domain.domain} style={{ marginBottom: "15px" }}>
            {/* Correct gebruik van <Link> zonder <a> */}
            <Link href={`/domains/${domain.domain.toLowerCase()}`} prefetch={false}>
              {domain.domain}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  // Pad naar het bestand met domeinen
  const filePath = path.join(process.cwd(), "data", "domains_data.json");

  // Leest het JSON-bestand op een asynchrone manier
  const jsonData = await fs.promises.readFile(filePath, "utf8");

  // Parse de JSON-data en stel deze in als een array
  const domains = JSON.parse(jsonData);

  // Return de domeinen als props
  return {
    props: {
      domains,
    },
    revalidate: 18000, // Revalidate de pagina elke 18000 seconden
  };
}
