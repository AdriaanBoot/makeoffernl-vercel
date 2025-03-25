import Link from "next/link";
import fs from "fs";
import path from "path";

export default function DomainsList({ domains }) {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1>Beschikbare Domeinen</h1>
      <ul>
        {domains.map((domain, index) => (
          <li key={index}>
            <Link href={`/domeinen/${domain.toLowerCase()}`}>
              {domain}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  // Haal de domeinnamen op uit het JSON-bestand
  const filePath = path.join(process.cwd(), "data", "domeinen.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  return {
    props: {
      domains: allDomains, // Geef de lijst van domeinen door als props
    },
  };
}
