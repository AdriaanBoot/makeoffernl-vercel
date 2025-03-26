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
            <Link href={`/domeinen/${domain.toLowerCase()}`} prefetch={false}>
              {domain}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "domeinen.json");

  // Gebruik fs.promises.readFile om het bestand asynchroon te lezen
  const jsonData = await fs.promises.readFile(filePath, "utf8");
  const allDomains = JSON.parse(jsonData);

  return {
    props: {
      domains: allDomains, // Geef de lijst van domeinen door als props
    },
    revalidate: 18000, // Revalidate de pagina elke 18000 seconden
  };
}
